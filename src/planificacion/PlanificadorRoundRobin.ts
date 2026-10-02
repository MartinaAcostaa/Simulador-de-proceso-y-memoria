import { IPlanificador } from '../interfaces/IPlanificador';
import { IProceso } from '../interfaces/IProceso';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class PlanificadorRoundRobin implements IPlanificador {
  private readonly _quantum: number;
  private readonly _colaListos: IProceso[] = [];

  constructor(quantum: number) {
    validarEnteroPositivo(quantum, 'El quantum');
    this._quantum = quantum;
  }

  get quantum(): number {
    return this._quantum;
  }

  hayListos(): boolean {
    return this._colaListos.length > 0;
  }

  obtenerPidsListos(): number[] {
    return this._colaListos.map((proceso) => proceso.pid);
  }
}