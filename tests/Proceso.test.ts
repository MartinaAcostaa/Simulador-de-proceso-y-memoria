import { describe, it, expect } from 'vitest';
import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

describe('Proceso', () => {
  it('se crea en estado NUEVO con la CPU restante igual a la total', () => {
    const proceso = new Proceso(1, 100, 5);
    expect(proceso.estado).toBe(EstadoProceso.NUEVO);
    expect(proceso.tiempoCpuRestante).toBe(5);
  });
  
  it('rechaza un PID que no sea entero positivo', () => {
    expect(() => new Proceso(0, 100, 5)).toThrow();
    expect(() => new Proceso(-3, 100, 5)).toThrow();
    expect(() => new Proceso(1.5, 100, 5)).toThrow();
  });

  it('rechaza una memoria requerida que no sea entero positivo', () => {
    expect(() => new Proceso(1, 0, 5)).toThrow();
    expect(() => new Proceso(1, -100, 5)).toThrow();
    expect(() => new Proceso(1, 100.5, 5)).toThrow();
  });

  it('rechaza un tiempo de CPU que no sea entero positivo', () => {
    expect(() => new Proceso(1, 100, 0)).toThrow();
    expect(() => new Proceso(1, 100, -5)).toThrow();
    expect(() => new Proceso(1, 100, 5.5)).toThrow();
  });
  
  it('pasa de NUEVO a LISTO al ser admitido', () => {
    const proceso = new Proceso(1, 100, 5);

    proceso.admitir();

    expect(proceso.estado).toBe(EstadoProceso.LISTO);
  });

  it('pasa de NUEVO a ESPERANDO_MEMORIA si no hay memoria, y después a LISTO', () => {
    const proceso = new Proceso(1, 100, 5);

    proceso.esperarMemoria();
    expect(proceso.estado).toBe(EstadoProceso.ESPERANDO_MEMORIA);

    proceso.admitir();
    expect(proceso.estado).toBe(EstadoProceso.LISTO);
  });

  it('no puede admitirse dos veces', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();

    expect(() => proceso.admitir()).toThrow();
  });

    it('pasa de LISTO a EJECUTANDO al ser despachado, con el quantum en 0', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();

    proceso.despachar();

    expect(proceso.estado).toBe(EstadoProceso.EJECUTANDO);
    expect(proceso.quantumConsumido).toBe(0);
  });

  it('no puede despacharse si no está LISTO', () => {
    const proceso = new Proceso(1, 100, 5); // está en NUEVO

    expect(() => proceso.despachar()).toThrow();
  });

  it('al ejecutar un tick resta 1 de CPU y suma 1 al quantum consumido', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();
    proceso.despachar();

    proceso.ejecutarTick();
    proceso.ejecutarTick();

    expect(proceso.tiempoCpuRestante).toBe(3);
    expect(proceso.quantumConsumido).toBe(2);
  });

  it('no puede ejecutar si no está EJECUTANDO', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();

    expect(() => proceso.ejecutarTick()).toThrow();
  });
  
  it('necesita CPU mientras le quede, y deja de necesitarla al consumirla toda', () => {
    const proceso = new Proceso(1, 100, 2);
    proceso.admitir();
    proceso.despachar();

    expect(proceso.necesitaCpu()).toBe(true);
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    expect(proceso.necesitaCpu()).toBe(false);
  });

  it('pasa a TERMINADO cuando consumió toda su CPU', () => {
    const proceso = new Proceso(1, 100, 2);
    proceso.admitir();
    proceso.despachar();
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    proceso.terminar();

    expect(proceso.estado).toBe(EstadoProceso.TERMINADO);
  });

  it('no puede terminar si todavía le queda CPU', () => {
    const proceso = new Proceso(1, 100, 2);
    proceso.admitir();
    proceso.despachar();
    proceso.ejecutarTick();

    expect(() => proceso.terminar()).toThrow();
  });

  it('no puede ejecutar un tick si ya no le queda CPU', () => {
    const proceso = new Proceso(1, 100, 2);
    proceso.admitir();
    proceso.despachar();
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    expect(() => proceso.ejecutarTick()).toThrow();
  });
  
  it('guarda el PID, la memoria requerida y el tiempo de CPU total', () => {
    const proceso = new Proceso(7, 256, 4);

    expect(proceso.pid).toBe(7);
    expect(proceso.memoriaRequerida).toBe(256);
    expect(proceso.tiempoCpuTotal).toBe(4);
  });

  it('agota el quantum cuando consumió tantos ticks como el quantum', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();
    proceso.despachar();

    proceso.ejecutarTick();
    expect(proceso.agotoQuantum(2)).toBe(false);   // consumió 1 de 2

    proceso.ejecutarTick();
    expect(proceso.agotoQuantum(2)).toBe(true);    // consumió 2 de 2
  });

  it('rechaza un quantum que no sea entero positivo', () => {
    const proceso = new Proceso(1, 100, 5);

    expect(() => proceso.agotoQuantum(0)).toThrow();
    expect(() => proceso.agotoQuantum(-2)).toThrow();
    expect(() => proceso.agotoQuantum(1.5)).toThrow();
  });

  it('vuelve a LISTO al ser expropiado', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();
    proceso.despachar();
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    proceso.expropiar();

    expect(proceso.estado).toBe(EstadoProceso.LISTO);
    expect(proceso.tiempoCpuRestante).toBe(3);   // no pierde lo que ya avanzó
  });

  it('no puede ser expropiado si no está EJECUTANDO', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();   // está LISTO

    expect(() => proceso.expropiar()).toThrow();
  });

  it('al renovar el quantum sigue EJECUTANDO con el quantum en 0', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();
    proceso.despachar();
    proceso.ejecutarTick();
    proceso.ejecutarTick();

    proceso.renovarQuantum();

    expect(proceso.estado).toBe(EstadoProceso.EJECUTANDO);
    expect(proceso.quantumConsumido).toBe(0);
    expect(proceso.tiempoCpuRestante).toBe(3);   // renovar NO devuelve CPU
  });

  it('no puede renovar el quantum si no está EJECUTANDO', () => {
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();

    expect(() => proceso.renovarQuantum()).toThrow();
  });
});




