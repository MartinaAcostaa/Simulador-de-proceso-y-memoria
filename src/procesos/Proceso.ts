import { IProceso } from '../interfaces/IProceso';
import { EstadoProceso } from './EstadoProceso';

export class Proceso implements IProceso {
  private _pid: number;
  private _memoriaRequerida: number;
  private _tiempoCpuTotal: number;
  private _tiempoCpuRestante: number;
  private _estado: EstadoProceso;
  private _quantumConsumido: number;

  constructor(pid: number, memoriaRequerida: number, tiempoCpuTotal: number) {
    this.validarEnteroPositivo(pid, 'PID');
    this.validarEnteroPositivo(memoriaRequerida, 'Memoria requerida');
    this.validarEnteroPositivo(tiempoCpuTotal, 'Tiempo de CPU total');

    this._pid = pid;
    this._memoriaRequerida = memoriaRequerida;
    this._tiempoCpuTotal = tiempoCpuTotal;
    this._tiempoCpuRestante = tiempoCpuTotal;
    this._estado = EstadoProceso.NUEVO;
    this._quantumConsumido = 0;
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

  necesitaCpu(): boolean {
    return this._tiempoCpuRestante > 0;
  }

  agotoQuantum(quantum: number): boolean {
    this.validarEnteroPositivo(quantum, 'Quantum');
    return this._quantumConsumido >= quantum;
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

  terminar(): void {
    this.validarEstado([EstadoProceso.EJECUTANDO], 'terminar');
    if (this.necesitaCpu()) {
      throw new Error(`El proceso ${this._pid} todavía necesita ${this._tiempoCpuRestante} ticks de CPU`);
    }
    this._estado = EstadoProceso.TERMINADO;
  }

  private validarEnteroPositivo(valor: number, nombre: string): void {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new Error(`${nombre} debe ser un entero positivo`);
    }
  }

  private validarEstado(permitidos: EstadoProceso[], accion: string): void {
    if (!permitidos.includes(this._estado)) {
      throw new Error(`No se puede ${accion} el proceso ${this._pid} en estado ${this._estado}`);
    }
  }
}