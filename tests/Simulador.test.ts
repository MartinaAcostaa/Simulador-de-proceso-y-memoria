import { describe, it, expect } from 'vitest';
import { Simulador } from '../src/simulacion/Simulador';
import { Memoria } from '../src/memoria/Memoria';
import { FirstFit } from '../src/memoria/FirstFit';
import { PlanificadorRoundRobin } from '../src/planificacion/PlanificadorRoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

function crearSimulador(memoria = 1000, quantum = 2): Simulador {
  return new Simulador(new Memoria(memoria, new FirstFit()), new PlanificadorRoundRobin(quantum));
}

describe('Simulador - creación', () => {
  it('arranca sin procesos listos y con toda la memoria libre', () => {
    const simulador = crearSimulador(1000);

    expect(simulador.obtenerPidsListos()).toEqual([]);
    expect(simulador.obtenerMapaMemoria()).toEqual([{ inicio: 0, tamanio: 1000, pid: null }]);
  });
});

describe('Simulador - registro de procesos', () => {
  it('registra un proceso, que queda en estado NUEVO', () => {
    const simulador = crearSimulador();

    simulador.registrarProceso(new Proceso(1, 100, 5));

    expect(simulador.obtenerEstado(1)).toBe(EstadoProceso.NUEVO);
  });

  it('da error al consultar un PID que no está registrado', () => {
    const simulador = crearSimulador();

    expect(() => simulador.obtenerEstado(99)).toThrow();
  });

  it('no acepta dos procesos con el mismo PID', () => {
    const simulador = crearSimulador();
    simulador.registrarProceso(new Proceso(1, 100, 5));

    expect(() => simulador.registrarProceso(new Proceso(1, 200, 3))).toThrow();
  });

  it('no acepta un proceso que pide más memoria que el total', () => {
    const simulador = crearSimulador(1000);

    expect(() => simulador.registrarProceso(new Proceso(1, 1001, 5))).toThrow();
  });

  it('no acepta un proceso que no esté en estado NUEVO', () => {
    const simulador = crearSimulador();
    const proceso = new Proceso(1, 100, 5);
    proceso.admitir();

    expect(() => simulador.registrarProceso(proceso)).toThrow();
  });
});

describe('Simulador - fase 1: admisión', () => {
  it('cada tick avanza el reloj en uno', () => {
    const simulador = crearSimulador();
    expect(simulador.reloj).toBe(0);

    simulador.ejecutarTick();
    simulador.ejecutarTick();

    expect(simulador.reloj).toBe(2);
  });
  
  it('asigna memoria en orden de registro y pasa los procesos a LISTO', () => {
    const simulador = crearSimulador(1000);
    simulador.registrarProceso(new Proceso(1, 300, 5));
    simulador.registrarProceso(new Proceso(2, 200, 5));

    simulador.ejecutarTick();

    expect(simulador.obtenerEstado(2)).toBe(EstadoProceso.LISTO);
    expect(simulador.obtenerPidsListos()).toContain(2);
    expect(simulador.obtenerMapaMemoria()).toEqual([
      { inicio: 0, tamanio: 300, pid: 1 },
      { inicio: 300, tamanio: 200, pid: 2 },
      { inicio: 500, tamanio: 500, pid: null },
    ]);
  });
  
  it('el que no entra queda esperando memoria y se reintenta en cada tick', () => {
    const simulador = crearSimulador(1000);
    simulador.registrarProceso(new Proceso(1, 600, 5));
    simulador.registrarProceso(new Proceso(2, 600, 5));

    simulador.ejecutarTick();
    simulador.ejecutarTick();

    expect(simulador.obtenerEstado(2)).toBe(EstadoProceso.ESPERANDO_MEMORIA);
    expect(simulador.obtenerPidsEsperandoMemoria()).toEqual([2]);
  });
});