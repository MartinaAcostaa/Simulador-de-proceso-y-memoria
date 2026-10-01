import { EstadoProceso } from '../procesos/EstadoProceso';

export interface IProceso {
  readonly pid: number;
  readonly memoriaRequerida: number;
  readonly tiempoCpuTotal: number;
  readonly tiempoCpuRestante: number;
  readonly estado: EstadoProceso;

esperarMemoria(): void;
admitir(): void;
despachar(): void;                
ejecutarTick(): void;     
}
