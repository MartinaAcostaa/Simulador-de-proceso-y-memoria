import { IBloqueMemoria } from '../interfaces/IBloqueMemoria';
import { EstrategiaPorComparacion } from './EstrategiaPorComparacion';

export class WorstFit extends EstrategiaPorComparacion {
  override readonly nombre = 'Worst-Fit';

  protected override esMejor(candidato: IBloqueMemoria, actual: IBloqueMemoria): boolean {
    return candidato.tamanio > actual.tamanio;
  }
}