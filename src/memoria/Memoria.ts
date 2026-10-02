import { IMemoria, InfoBloque } from '../interfaces/IMemoria';
import { IEstrategiaAsignacion } from '../interfaces/IEstrategiaAsignacion';
import { BloqueMemoria } from './BloqueMemoria';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class Memoria implements IMemoria {
  private _tamanioTotal: number;
  private _estrategia: IEstrategiaAsignacion;
  private _bloques: BloqueMemoria[];  

  constructor(tamanioTotal: number, estrategia: IEstrategiaAsignacion) {
    validarEnteroPositivo(tamanioTotal, 'El tamaño de la memoria');

    this._tamanioTotal = tamanioTotal;
    this._estrategia = estrategia;
    this._bloques = [new BloqueMemoria(0, tamanioTotal)];  
  }

  get tamanioTotal(): number {
    return this._tamanioTotal;
  }

  get nombreEstrategia(): string {
    return this._estrategia.nombre;
  }

  asignar(pid: number, tamanio: number): boolean {
    const indice = this._estrategia.elegirBloque(this._bloques, tamanio);
    if (indice === -1) {
      return false;
    }
    this.ocuparBloque(indice, pid);
    return true;
  }

  tieneAsignado(pid: number): boolean {
    return this._bloques.some((bloque) => bloque.pid === pid);
  }

  obtenerMapa(): InfoBloque[] {
    return this._bloques.map((bloque) => ({ inicio: bloque.inicio, tamanio: bloque.tamanio, pid: bloque.pid }));
  }

  private ocuparBloque(indice: number, pid: number): void {
    const elegido = this._bloques[indice] as BloqueMemoria;
    elegido.ocupar(pid);
  }
}