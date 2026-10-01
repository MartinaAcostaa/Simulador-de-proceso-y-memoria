import { IProceso } from '../interfaces/IProceso';
import { EstadoProceso } from './EstadoProceso';

export class Proceso implements IProceso {
  private _pid: number;
  private _memoriaRequerida: number;
  private _tiempoCpuTotal: number;
  private _tiempoCpuRestante: number;
  private _estado: EstadoProceso;

  constructor(pid: number, memoriaRequerida: number, tiempoCpuTotal: number) {
    this._pid = pid;
    this._memoriaRequerida = memoriaRequerida;
    this._tiempoCpuTotal = tiempoCpuTotal;
    this._tiempoCpuRestante = tiempoCpuTotal;
    this._estado = EstadoProceso.NUEVO;
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
}