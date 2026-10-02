import { ISimulador } from '../interfaces/ISimulador';
import { IMemoria, InfoBloque } from '../interfaces/IMemoria';
import { IPlanificador } from '../interfaces/IPlanificador';
import { IProceso } from '../interfaces/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';

export class Simulador implements ISimulador {
  private readonly _memoria: IMemoria;
  private readonly _planificador: IPlanificador;
  private readonly _procesos: IProceso[] = [];

  constructor(memoria: IMemoria, planificador: IPlanificador) {
    this._memoria = memoria;
    this._planificador = planificador;
  }

  registrarProceso(proceso: IProceso): void {
    this.validarRegistro(proceso);
    this._procesos.push(proceso);
  }

  obtenerEstado(pid: number): EstadoProceso {
    return this.buscarProceso(pid).estado;
  }

  obtenerPidsListos(): number[] {
    return this._planificador.obtenerPidsListos();
  }

  obtenerMapaMemoria(): InfoBloque[] {
    return this._memoria.obtenerMapa();
  }
  private validarRegistro(proceso: IProceso): void {
    if (proceso.estado !== EstadoProceso.NUEVO) {
      throw new Error(`El proceso ${proceso.pid} tiene que estar en estado NUEVO`);
    }
    if (this._procesos.some((p) => p.pid === proceso.pid)) {
      throw new Error(`Ya hay un proceso registrado con PID ${proceso.pid}`);
    }
    if (proceso.memoriaRequerida > this._memoria.tamanioTotal) {
      throw new Error(`El proceso ${proceso.pid} pide más memoria que la total`);
    }
  }

  private buscarProceso(pid: number): IProceso {
    const proceso = this._procesos.find((p) => p.pid === pid);
    if (proceso === undefined) {
      throw new Error(`No hay ningún proceso registrado con PID ${pid}`);
    }
    return proceso;
  }
}