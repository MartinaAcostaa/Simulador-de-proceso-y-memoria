import { IGestorES } from '../interfaces/IGestorES';
import { IProceso } from '../interfaces/IProceso';

export class GestorES implements IGestorES {
  private readonly _bloqueados: IProceso[] = [];

  hayBloqueados(): boolean {
    return this._bloqueados.length > 0;
  }

  obtenerPidsBloqueados(): number[] {
    return this._bloqueados.map((proceso) => proceso.pid);
  }
}