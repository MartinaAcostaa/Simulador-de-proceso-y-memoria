import { IGestorES } from '../interfaces/IGestorES';
import { IProceso } from '../interfaces/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';

export class GestorES implements IGestorES {
  private readonly _bloqueados: IProceso[] = [];

  hayBloqueados(): boolean {
    return this._bloqueados.length > 0;
  }

  obtenerPidsBloqueados(): number[] {
    return this._bloqueados.map((proceso) => proceso.pid);
  }
    agregarBloqueado(proceso: IProceso): void {
    if (proceso.estado !== EstadoProceso.BLOQUEADO) {
      throw new Error(`El proceso ${proceso.pid} no está BLOQUEADO`);
    }
    this._bloqueados.push(proceso);
  }
    avanzarBloqueos(): IProceso[] {
    this._bloqueados.forEach((proceso) => proceso.avanzarBloqueo());
    const terminados = this._bloqueados.filter((proceso) => proceso.bloqueoRestante === 0);
    terminados.forEach((proceso) => this.sacarDeBloqueados(proceso));
    return terminados;
  }

  private sacarDeBloqueados(proceso: IProceso): void {
    proceso.desbloquear();
    this._bloqueados.splice(this._bloqueados.indexOf(proceso), 1);
  }
}