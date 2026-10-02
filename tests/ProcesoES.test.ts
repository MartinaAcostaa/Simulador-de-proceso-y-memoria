import { describe, it, expect } from 'vitest';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

function crearProcesoConES(): Proceso {
  const proceso = new Proceso(1, 100, 5, new EventoES(2, 3));
  proceso.admitir();
  proceso.despachar();
  return proceso;
}

describe('Proceso con Entrada/Salida', () => {
  it('rechaza un evento que se dispararía cuando el proceso ya terminó', () => {
    expect(() => new Proceso(1, 100, 2, new EventoES(2, 1))).toThrow();
    expect(() => new Proceso(1, 100, 2, new EventoES(5, 1))).toThrow();
  });

  it('un proceso sin evento de E/S nunca debe bloquearse', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();
    proceso.despachar();
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    expect(proceso.debeBloquearse()).toBe(false);
  });

  it('debe bloquearse justo al consumir los ticks de CPU del evento', () => {
    const proceso = crearProcesoConES();

    proceso.ejecutarTick();
    expect(proceso.debeBloquearse()).toBe(false);   

    proceso.ejecutarTick();
    expect(proceso.debeBloquearse()).toBe(true);    
  });

  it('al bloquearse pasa a BLOQUEADO, conserva su CPU restante e inicia el temporizador', () => {
    const proceso = crearProcesoConES();
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    proceso.bloquear();

    expect(proceso.estado).toBe(EstadoProceso.BLOQUEADO);
    expect(proceso.tiempoCpuRestante).toBe(3);
    expect(proceso.bloqueoRestante).toBe(3);
  });

  it('no puede bloquearse si no le toca la E/S', () => {
    const proceso = crearProcesoConES();
    proceso.ejecutarTick();   

    expect(() => proceso.bloquear()).toThrow();
  });

  it('avanza el bloqueo y vuelve a LISTO solo cuando el temporizador llega a 0', () => {
    const proceso = crearProcesoConES();
    proceso.ejecutarTick();
    proceso.ejecutarTick();
    proceso.bloquear();

    proceso.avanzarBloqueo();
    proceso.avanzarBloqueo();
    expect(proceso.bloqueoRestante).toBe(1);
    expect(() => proceso.desbloquear()).toThrow();   

    proceso.avanzarBloqueo();
    proceso.desbloquear();

    expect(proceso.bloqueoRestante).toBe(0);
    expect(proceso.estado).toBe(EstadoProceso.LISTO);
  });

  it('no puede avanzar el bloqueo si no está BLOQUEADO o si ya terminó la E/S', () => {
    const proceso = crearProcesoConES();
    expect(() => proceso.avanzarBloqueo()).toThrow();   

    proceso.ejecutarTick();
    proceso.ejecutarTick();
    proceso.bloquear();
    proceso.avanzarBloqueo();
    proceso.avanzarBloqueo();
    proceso.avanzarBloqueo();

    expect(() => proceso.avanzarBloqueo()).toThrow();   
  });

  it('la E/S ocurre una sola vez', () => {
    const proceso = crearProcesoConES();
    proceso.ejecutarTick();
    proceso.ejecutarTick();
    proceso.bloquear();
    proceso.avanzarBloqueo();
    proceso.avanzarBloqueo();
    proceso.avanzarBloqueo();
    proceso.desbloquear();
    proceso.despachar();

    expect(proceso.debeBloquearse()).toBe(false);
  });
});