import { IBloqueMemoria } from '../interfaces/IBloqueMemoria';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class BloqueMemoria implements IBloqueMemoria {
  private _inicio: number;
  private _tamanio: number;
  private _pid: number | null;

  constructor(inicio: number, tamanio: number) {
    if (!Number.isInteger(inicio) || inicio < 0) {
      throw new Error('El inicio del bloque debe ser un entero mayor o igual a 0');
    }
    validarEnteroPositivo(tamanio, 'El tamaño del bloque');

    this._inicio = inicio;
    this._tamanio = tamanio;
    this._pid = null;
  }

  get inicio(): number {
    return this._inicio;
  }

  get tamanio(): number {
    return this._tamanio;
  }

  get fin(): number {
    return this._inicio + this._tamanio;
  }

  get pid(): number | null {
    return this._pid;
  }

  estaLibre(): boolean {
    return this._pid === null;
  }

  ocupar(pid: number): void {
    validarEnteroPositivo(pid, 'El PID');
    if (!this.estaLibre()) {
      throw new Error(`El bloque en ${this._inicio} ya está ocupado por el proceso ${this._pid}`);
    }
    this._pid = pid;
  }

  liberar(): void {
    if (this.estaLibre()) {
      throw new Error(`El bloque en ${this._inicio} ya está libre`);
    }
    this._pid = null;
  }
}