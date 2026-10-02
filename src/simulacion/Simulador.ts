import { ISimulador } from '../interfaces/ISimulador';
import { IMemoria, InfoBloque } from '../interfaces/IMemoria';
import { IPlanificador } from '../interfaces/IPlanificador';
import { IProceso } from '../interfaces/IProceso';
import { IMetricas } from '../interfaces/IMetricas';
import { IGestorES } from '../interfaces/IGestorES';
import { GestorES } from '../planificacion/GestorES';
import { EstadoProceso } from '../procesos/EstadoProceso';
import { Metricas } from './Metricas';

export class Simulador implements ISimulador {
  private readonly _memoria: IMemoria;
  private readonly _planificador: IPlanificador;
  private readonly _gestorES: IGestorES = new GestorES();
  private readonly _metricas: IMetricas = new Metricas();
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
    this.avanzarEntradaSalida();
    const pidEjecutado = this.ejecutarCpu();
    this._historialCpu.push(pidEjecutado);
    this._metricas.registrarTick(pidEjecutado !== null);
    this._reloj++;
  }
  
  ejecutarHastaTerminar(): void {
    while (!this.haTerminado()) {
      this.ejecutarTick();
    }
  }

  haTerminado(): boolean {
    return this._procesos.every((p) => p.estado === EstadoProceso.TERMINADO);
  }

  obtenerPidsEsperandoMemoria(): number[] {
    return this.filtrarPorEstado(EstadoProceso.ESPERANDO_MEMORIA).map((p) => p.pid);
  }

  obtenerPidsListos(): number[] {
    return this._planificador.obtenerPidsListos();
  }

  obtenerPidsBloqueados(): number[] {
    return this._gestorES.obtenerPidsBloqueados();
  }

  obtenerMapaMemoria(): InfoBloque[] {
    return this._memoria.obtenerMapa();
  }

  obtenerHistorialCpu(): (number | null)[] {
    return [...this._historialCpu];
  }

  obtenerCambiosContexto(): number {
    return this._metricas.cambiosContexto;
  }
  
  calcularUsoCpu(): number {
    return this._metricas.calcularUsoCpu();
  }

  calcularFragmentacionExterna(): number {
    return this._memoria.calcularFragmentacionExterna();
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

  private avanzarEntradaSalida(): void {
    this._gestorES.avanzarBloqueos().forEach((proceso) => this._planificador.agregarListo(proceso));
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
    } else if (proceso.debeBloquearse()) {
      this.bloquearProceso(proceso);
    } else if (this._planificador.debeExpropiar(proceso)) {
      this.expropiarProceso(proceso);
    } else if (this._planificador.debeRenovarQuantum(proceso)) {
      proceso.renovarQuantum();
    }
  }

  private bloquearProceso(proceso: IProceso): void {
    proceso.bloquear();
    this._gestorES.agregarBloqueado(proceso);
    this._metricas.registrarCambioContexto();
    this._enCpu = null;
  }

  private expropiarProceso(proceso: IProceso): void {
    proceso.expropiar();
    this._planificador.agregarListo(proceso);
    this._metricas.registrarCambioContexto();
    this._enCpu = null;
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