import { IEventoES } from '../interfaces/IEventoES';
import { validarEnteroPositivo } from '../validaciones/validarEnteroPositivo';

export class EventoES implements IEventoES {
  private _despuesDeTicksCpu: number;
  private _duracion: number;

  constructor(despuesDeTicksCpu: number, duracion: number) {
    validarEnteroPositivo(despuesDeTicksCpu, 'El disparo de E/S');
    validarEnteroPositivo(duracion, 'La duración de E/S');

    this._despuesDeTicksCpu = despuesDeTicksCpu;
    this._duracion = duracion;
  }

  get despuesDeTicksCpu(): number {
    return this._despuesDeTicksCpu;
  }

  get duracion(): number {
    return this._duracion;
  }
}