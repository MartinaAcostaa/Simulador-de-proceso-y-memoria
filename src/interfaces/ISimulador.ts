import { InfoBloque } from './IMemoria';

export interface ISimulador {
  obtenerPidsListos(): number[];
  obtenerMapaMemoria(): InfoBloque[];
}