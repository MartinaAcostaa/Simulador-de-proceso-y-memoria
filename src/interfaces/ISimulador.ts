import { InfoBloque } from './IMemoria';
import { IProceso } from './IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';

export interface ISimulador {
  registrarProceso(proceso: IProceso): void;
  obtenerEstado(pid: number): EstadoProceso;
  obtenerPidsListos(): number[];
  obtenerMapaMemoria(): InfoBloque[];
}