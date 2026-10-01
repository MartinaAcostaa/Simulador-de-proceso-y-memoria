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

  esperarMemoria(): void {
    if (this._estado !== EstadoProceso.NUEVO) {
      throw new Error(`No se puede poner a esperar memoria al proceso ${this._pid} en estado ${this._estado}`);
    }
    this._estado = EstadoProceso.ESPERANDO_MEMORIA;
  }

  admitir(): void {
    if (this._estado !== EstadoProceso.NUEVO && this._estado !== EstadoProceso.ESPERANDO_MEMORIA) {
      throw new Error(`No se puede admitir el proceso ${this._pid} en estado ${this._estado}`);
    }
    this._estado = EstadoProceso.LISTO;
  }

  despachar(): void {
    if (this._estado !== EstadoProceso.LISTO) {
      throw new Error(`No se puede despachar el proceso ${this._pid} en estado ${this._estado}`);
    }
    this._estado = EstadoProceso.EJECUTANDO;
    this._quantumConsumido = 0;
  }

  ejecutarTick(): void {
    if (this._estado !== EstadoProceso.EJECUTANDO) {
      throw new Error(`El proceso ${this._pid} no puede ejecutar en estado ${this._estado}`);
    }
    this._tiempoCpuRestante--;
    this._quantumConsumido++;
  }

private validarEnteroPositivo(valor: number, nombre: string): void {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new Error(`${nombre} debe ser un entero positivo`);
    }
  }
}