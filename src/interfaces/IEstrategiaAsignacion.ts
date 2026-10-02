import { IBloqueMemoria } from './IBloqueMemoria';

export interface IEstrategiaAsignacion {
  readonly nombre: string;

  // Devuelve la posición del bloque elegido en la lista, o -1 si ninguno alcanza
  elegirBloque(bloques: readonly IBloqueMemoria[], tamanio: number): number;
}