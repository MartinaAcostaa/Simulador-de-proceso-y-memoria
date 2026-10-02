import { ISimulador } from '../interfaces/ISimulador';
import { IMemoria, InfoBloque } from '../interfaces/IMemoria';
import { IPlanificador } from '../interfaces/IPlanificador';
import { IProceso } from '../interfaces/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';

export class Simulador implements ISimulador {
  private readonly _memoria: IMemoria;
  private readonly _planificador: IPlanificador;
  private readonly _procesos: IProceso[] = [];
  private readonly _historialCpu: (number | null)[] = [];
  private _reloj = 0;
  private _enCpu: IProceso | null = null;

  constructor(memoria: IMemoria, planificador: IPlanificador) {
    this._memoria = memoria;
    this._planificador = planificador;
  }

  get reloj(): number {
    return this._reloj;
  }

  get pidEnCpu(): number | null {
    return this._enCpu === null ? null : this._enCpu.pid;
  }

  registrarProceso(proceso: IProceso): void {
    this.validarRegistro(proceso);
    this._procesos.push(proceso);
  }

  obtenerEstado(pid: number): EstadoProceso {
    return this.buscarProceso(pid).estado;
  }

  ejecutarTick(): void {
    this.admitirProcesos();
    this._historialCpu.push(this.ejecutarCpu());
    this._reloj++;
  }

  obtenerPidsEsperandoMemoria(): number[] {
    return this.filtrarPorEstado(EstadoProceso.ESPERANDO_MEMORIA).map((p) => p.pid);
  }

  obtenerPidsListos(): number[] {
    return this._planificador.obtenerPidsListos();
  }

  obtenerMapaMemoria(): InfoBloque[] {
    return this._memoria.obtenerMapa();
  }

  obtenerHistorialCpu(): (number | null)[] {
    return [...this._historialCpu];
  }

  private admitirProcesos(): void {
    this._procesos
      .filter((p) => p.estado === EstadoProceso.NUEVO || p.estado === EstadoProceso.ESPERANDO_MEMORIA)
      .forEach((proceso) => this.admitirProceso(proceso));
  }

  private admitirProceso(proceso: IProceso): void {
    if (this._memoria.asignar(proceso.pid, proceso.memoriaRequerida)) {
      proceso.admitir();
      this._planificador.agregarListo(proceso);
    } else if (proceso.estado === EstadoProceso.NUEVO) {
      proceso.esperarMemoria();
    }
  }

  private ejecutarCpu(): number | null {
    if (this._enCpu === null && this._planificador.hayListos()) {
      this.despacharSiguiente();
    }
    const proceso = this._enCpu;
    if (proceso === null) {
      return null;
    }
    proceso.ejecutarTick();
    this.resolverFinDeTick(proceso);
    return proceso.pid;
  }

  private resolverFinDeTick(proceso: IProceso): void {
    if (!proceso.necesitaCpu()) {
      this.terminarProceso(proceso);
    }
  }

  private terminarProceso(proceso: IProceso): void {
    proceso.terminar();
    this._memoria.liberar(proceso.pid);
    this._enCpu = null;
  }

  private despacharSiguiente(): void {
    const siguiente = this._planificador.tomarSiguiente();
    siguiente.despachar();
    this._enCpu = siguiente;
  }

  private filtrarPorEstado(estado: EstadoProceso): IProceso[] {
    return this._procesos.filter((p) => p.estado === estado);
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