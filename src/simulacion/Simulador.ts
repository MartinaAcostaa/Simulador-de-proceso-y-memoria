import { ISimulador } from '../interfaces/ISimulador';
import { IMemoria, InfoBloque } from '../interfaces/IMemoria';
import { IPlanificador } from '../interfaces/IPlanificador';

export class Simulador implements ISimulador {
  private readonly _memoria: IMemoria;
  private readonly _planificador: IPlanificador;

  constructor(memoria: IMemoria, planificador: IPlanificador) {
    this._memoria = memoria;
    this._planificador = planificador;
  }

  obtenerPidsListos(): number[] {
    return this._planificador.obtenerPidsListos();
  }

  obtenerMapaMemoria(): InfoBloque[] {
    return this._memoria.obtenerMapa();
  }
}