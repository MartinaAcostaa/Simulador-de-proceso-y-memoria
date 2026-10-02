import { IPlanificador } from '../interfaces/IPlanificador';
import { IProceso } from '../interfaces/IProceso';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';
import { EstadoProceso } from '../procesos/EstadoProceso';

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
  
    agregarListo(proceso: IProceso): void {
    if (proceso.estado !== EstadoProceso.LISTO) {
      throw new Error(`El proceso ${proceso.pid} no está LISTO`);
    }
    if (this._colaListos.includes(proceso)) {
      throw new Error(`El proceso ${proceso.pid} ya está en la cola de listos`);
    }
    this._colaListos.push(proceso);
  }
}