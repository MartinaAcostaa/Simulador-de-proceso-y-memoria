import { IBloqueMemoria } from '../interfaces/IBloqueMemoria';
import { EstrategiaPorComparacion } from './EstrategiaPorComparacion';

export class BestFit extends EstrategiaPorComparacion {
  override readonly nombre = 'Best-Fit';

  protected override esMejor(candidato: IBloqueMemoria, actual: IBloqueMemoria): boolean {
    return candidato.tamanio < actual.tamanio;
  }
}