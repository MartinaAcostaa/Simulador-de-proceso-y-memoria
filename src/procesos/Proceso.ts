import { IProceso } from '../interfaces/IProceso';
import { IEventoES } from '../interfaces/IEventoES';
import { EstadoProceso } from './EstadoProceso';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class Proceso implements IProceso {
  private _pid: number;
  private _memoriaRequerida: number;
  private _tiempoCpuTotal: number;
  private _tiempoCpuRestante: number;
  private _estado: EstadoProceso;
  private _quantumConsumido: number;
  private _eventoES: IEventoES | null;
  private _eventoRealizado: boolean;
  private _bloqueoRestante: number;

  constructor(pid: number, memoriaRequerida: number, tiempoCpuTotal: number, eventoES?: IEventoES) {
    validarEnteroPositivo(pid, 'PID');
    validarEnteroPositivo(memoriaRequerida, 'Memoria requerida');
    validarEnteroPositivo(tiempoCpuTotal, 'Tiempo de CPU total');
    if (eventoES && eventoES.despuesDeTicksCpu >= tiempoCpuTotal) {
      throw new Error('El evento de E/S tiene que dispararse antes de que el proceso termine su CPU');
    }

    this._pid = pid;
    this._memoriaRequerida = memoriaRequerida;
    this._tiempoCpuTotal = tiempoCpuTotal;
    this._tiempoCpuRestante = tiempoCpuTotal;
    this._estado = EstadoProceso.NUEVO;
    this._quantumConsumido = 0;
    this._eventoES = eventoES ?? null;
    this._eventoRealizado = false;
    this._bloqueoRestante = 0;
  }

  get pid(): number {
    return this._pid;
  }

  get memoriaRequerida(): number {
    return this._memoriaRequerida;
  }

  get tiempoCpuTotal(): number {
    return this._tiempoCpuTotal;
  }

  get tiempoCpuRestante(): number {
    return this._tiempoCpuRestante;
  }

  get estado(): EstadoProceso {
    return this._estado;
  }

  get quantumConsumido(): number {
    return this._quantumConsumido;
  }

  get bloqueoRestante(): number {
    return this._bloqueoRestante;
  }

  necesitaCpu(): boolean {
    return this._tiempoCpuRestante > 0;
  }

  agotoQuantum(quantum: number): boolean {
    validarEnteroPositivo(quantum, 'Quantum');
    return this._quantumConsumido >= quantum;
  }

  debeBloquearse(): boolean {
    if (this._eventoES === null || this._eventoRealizado) {
      return false;
    }
    const cpuConsumida = this._tiempoCpuTotal - this._tiempoCpuRestante;
    return cpuConsumida === this._eventoES.despuesDeTicksCpu;
  }

  esperarMemoria(): void {
    this.validarEstado([EstadoProceso.NUEVO], 'poner a esperar memoria');
    this._estado = EstadoProceso.ESPERANDO_MEMORIA;
  }

  admitir(): void {
    this.validarEstado([EstadoProceso.NUEVO, EstadoProceso.ESPERANDO_MEMORIA], 'admitir');
    this._estado = EstadoProceso.LISTO;
  }

  despachar(): void {
    this.validarEstado([EstadoProceso.LISTO], 'despachar');
    this._estado = EstadoProceso.EJECUTANDO;
    this._quantumConsumido = 0;
  }

  expropiar(): void {
    this.validarEstado([EstadoProceso.EJECUTANDO], 'expropiar');
    this._estado = EstadoProceso.LISTO;
  }

  bloquear(): void {
    this.validarEstado([EstadoProceso.EJECUTANDO], 'bloquear');
    if (!this.debeBloquearse()) {
      throw new Error(`Al proceso ${this._pid} no le corresponde una E/S en este momento`);
    }
    this._estado = EstadoProceso.BLOQUEADO;
    this._bloqueoRestante = (this._eventoES as IEventoES).duracion;
    this._eventoRealizado = true;
  }

  desbloquear(): void {
    this.validarEstado([EstadoProceso.BLOQUEADO], 'desbloquear');
    if (this._bloqueoRestante > 0) {
      throw new Error(`El proceso ${this._pid} todavía tiene ${this._bloqueoRestante} ticks de E/S`);
    }
    this._estado = EstadoProceso.LISTO;
  }

  ejecutarTick(): void {
    this.validarEstado([EstadoProceso.EJECUTANDO], 'ejecutar');
    if (!this.necesitaCpu()) {
      throw new Error(`El proceso ${this._pid} ya no tiene CPU restante`);
    }
    this._tiempoCpuRestante--;
    this._quantumConsumido++;
  }

  renovarQuantum(): void {
    this.validarEstado([EstadoProceso.EJECUTANDO], 'renovar el quantum de');
    this._quantumConsumido = 0;
  }

  avanzarBloqueo(): void {
    this.validarEstado([EstadoProceso.BLOQUEADO], 'avanzar el bloqueo de');
    if (this._bloqueoRestante === 0) {
      throw new Error(`El proceso ${this._pid} ya terminó su E/S`);
    }
    this._bloqueoRestante--;
  }

  terminar(): void {
    this.validarEstado([EstadoProceso.EJECUTANDO], 'terminar');
    if (this.necesitaCpu()) {
      throw new Error(`El proceso ${this._pid} todavía necesita ${this._tiempoCpuRestante} ticks de CPU`);
    }
    this._estado = EstadoProceso.TERMINADO;
  }


  private validarEstado(permitidos: EstadoProceso[], accion: string): void {
    if (!permitidos.includes(this._estado)) {
      throw new Error(`No se puede ${accion} el proceso ${this._pid} en estado ${this._estado}`);
    }
  }
}