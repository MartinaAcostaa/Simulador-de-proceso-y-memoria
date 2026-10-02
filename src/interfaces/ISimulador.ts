import { InfoBloque } from './IMemoria';
import { IProceso } from './IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';

export interface ISimulador {
  readonly reloj: number;
  readonly pidEnCpu: number | null;
  registrarProceso(proceso: IProceso): void;
  obtenerEstado(pid: number): EstadoProceso;
  ejecutarTick(): void;
  obtenerPidsEsperandoMemoria(): number[];
  obtenerPidsListos(): number[];
  obtenerMapaMemoria(): InfoBloque[];
  obtenerHistorialCpu(): (number | null)[];
  obtenerCambiosContexto(): number;
}