import { IBloqueMemoria } from '../interfaces/IBloqueMemoria';
import { IEstrategiaAsignacion } from '../interfaces/IEstrategiaAsignacion';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class FirstFit implements IEstrategiaAsignacion {
  readonly nombre = 'First-Fit';

  elegirBloque(bloques: readonly IBloqueMemoria[], tamanio: number): number {
    validarEnteroPositivo(tamanio, 'El tamaño pedido');
    return bloques.findIndex((bloque) => bloque.estaLibre() && bloque.tamanio >= tamanio);
  }
}