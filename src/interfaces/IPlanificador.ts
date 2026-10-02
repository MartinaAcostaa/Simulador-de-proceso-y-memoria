import { IProceso } from './IProceso';

export interface IPlanificador {
  readonly quantum: number;
  hayListos(): boolean;
  obtenerPidsListos(): number[];
  agregarListo(proceso: IProceso): void;
   tomarSiguiente(): IProceso;
}
