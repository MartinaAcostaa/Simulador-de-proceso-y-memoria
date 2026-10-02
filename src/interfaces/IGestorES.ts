import { IProceso } from './IProceso';

export interface IGestorES {
  hayBloqueados(): boolean;
  obtenerPidsBloqueados(): number[];
  agregarBloqueado(proceso: IProceso): void;
}