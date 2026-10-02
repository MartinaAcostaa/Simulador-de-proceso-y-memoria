import { IBloqueMemoria } from '../interfaces/IBloqueMemoria';
import { IEstrategiaAsignacion } from '../interfaces/IEstrategiaAsignacion';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export abstract class EstrategiaPorComparacion implements IEstrategiaAsignacion {
  abstract readonly nombre: string;

  elegirBloque(bloques: readonly IBloqueMemoria[], tamanio: number): number {
    validarEnteroPositivo(tamanio, 'El tamaño pedido');
    let elegido = -1;
    bloques.forEach((bloque, indice) => {
      if (!bloque.estaLibre() || bloque.tamanio < tamanio) {
        return;
      }
      
      if (elegido === -1 || this.esMejor(bloque, bloques[elegido] as IBloqueMemoria)) {
        elegido = indice;
      }
    });
    return elegido;
  }

  protected abstract esMejor(candidato: IBloqueMemoria, actual: IBloqueMemoria): boolean;
}