import { IMemoria } from '../interfaces/IMemoria';
import { IEstrategiaAsignacion } from '../interfaces/IEstrategiaAsignacion';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class Memoria implements IMemoria {
  private _tamanioTotal: number;
  private _estrategia: IEstrategiaAsignacion;

  constructor(tamanioTotal: number, estrategia: IEstrategiaAsignacion) {
    validarEnteroPositivo(tamanioTotal, 'El tamaño de la memoria');

    this._tamanioTotal = tamanioTotal;
    this._estrategia = estrategia;
  }

  get tamanioTotal(): number {
    return this._tamanioTotal;
  }

  get nombreEstrategia(): string {
    return this._estrategia.nombre;
  }
}