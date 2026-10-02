import { InfoBloque } from './IMemoria';
import { IProceso } from './IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';

export interface ISimulador {
  readonly reloj: number;
  readonly pidEnCpu: number | null;
  registrarProceso(proceso: IProceso): void;
  obtenerEstado(pid: number): EstadoProceso;
  ejecutarTick(): void;
  ejecutarHastaTerminar(): void;
  haTerminado(): boolean;
  obtenerPidsEsperandoMemoria(): number[];
  obtenerPidsListos(): number[];
  obtenerPidsBloqueados(): number[];
  obtenerMapaMemoria(): InfoBloque[];
  obtenerHistorialCpu(): (number | null)[];
  obtenerCambiosContexto(): number;
  calcularUsoCpu(): number;
  calcularFragmentacionExterna(): number;
}