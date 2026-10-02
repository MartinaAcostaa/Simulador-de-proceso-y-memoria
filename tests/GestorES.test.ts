import { describe, it, expect } from 'vitest';
import { GestorES } from '../src/planificacion/GestorES';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

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
  describe('GestorES - avanzar bloqueos', () => {
  it('descuenta un tick de E/S a todos los bloqueados', () => {
    const gestor = new GestorES();
    const p1 = crearBloqueado(1, 3);
    const p2 = crearBloqueado(2, 2);
    gestor.agregarBloqueado(p1);
    gestor.agregarBloqueado(p2);

    gestor.avanzarBloqueos();

    expect(p1.bloqueoRestante).toBe(2);
    expect(p2.bloqueoRestante).toBe(1);
  });

  it('devuelve en orden los que terminaron la E/S, ya LISTOS, y los saca', () => {
    const gestor = new GestorES();
    gestor.agregarBloqueado(crearBloqueado(1, 1));
    gestor.agregarBloqueado(crearBloqueado(2, 2));
    gestor.agregarBloqueado(crearBloqueado(3, 1));

    const terminados = gestor.avanzarBloqueos();

    expect(terminados.map((proceso) => proceso.pid)).toEqual([1, 3]);
    expect(terminados.every((p) => p.estado === EstadoProceso.LISTO)).toBe(true);
    expect(gestor.obtenerPidsBloqueados()).toEqual([2]);
  });

  it('sin bloqueados devuelve una lista vacía', () => {
    expect(new GestorES().avanzarBloqueos()).toEqual([]);
  });
});
  });
