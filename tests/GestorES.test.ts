import { describe, it, expect } from 'vitest';
import { GestorES } from '../src/planificacion/GestorES';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';

function crearBloqueado(pid: number, duracion: number): Proceso {
  const proceso = new Proceso(pid, 100, 5, new EventoES(1, duracion));
  proceso.admitir();
  proceso.despachar();
  proceso.ejecutarTick();
  proceso.bloquear();
  return proceso;
}

describe('GestorES - bloqueados', () => {
  it('arranca sin procesos bloqueados', () => {
    const gestor = new GestorES();

    expect(gestor.hayBloqueados()).toBe(false);
    expect(gestor.obtenerPidsBloqueados()).toEqual([]);
  });

  it('agrega procesos bloqueados en orden de llegada', () => {
    const gestor = new GestorES();

    gestor.agregarBloqueado(crearBloqueado(1, 3));
    gestor.agregarBloqueado(crearBloqueado(2, 1));

    expect(gestor.hayBloqueados()).toBe(true);
    expect(gestor.obtenerPidsBloqueados()).toEqual([1, 2]);
  });

  it('no acepta un proceso que no esté BLOQUEADO', () => {
    const gestor = new GestorES();

    expect(() => gestor.agregarBloqueado(new Proceso(1, 100, 5))).toThrow();
  });
  });
