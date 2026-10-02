import { EstadoProceso } from '../procesos/EstadoProceso';

export interface IProceso {
  readonly pid: number;
  readonly memoriaRequerida: number;
  readonly tiempoCpuTotal: number;
  readonly tiempoCpuRestante: number;
  readonly estado: EstadoProceso;
  readonly quantumConsumido: number;
  readonly bloqueoRestante: number;

  necesitaCpu(): boolean;
  agotoQuantum(quantum: number): boolean;
  debeBloquearse(): boolean;

  esperarMemoria(): void;
  admitir(): void;
  despachar(): void;
  expropiar(): void;
  bloquear(): void;
  desbloquear(): void;
  terminar(): void;

  ejecutarTick(): void;
  renovarQuantum(): void;
  avanzarBloqueo(): void;
}