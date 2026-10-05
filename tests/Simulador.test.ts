import { describe, it, expect } from 'vitest';
import { Simulador } from '../src/simulacion/Simulador';
import { Memoria } from '../src/memoria/Memoria';
import { FirstFit } from '../src/memoria/FirstFit';
import { PlanificadorRoundRobin } from '../src/planificacion/PlanificadorRoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';
import { EventoES } from '../src/procesos/EventoES';

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

describe('Simulador - fase 3: CPU', () => {
  it('despacha al primero de la cola y le da un tick de CPU', () => {
    const simulador = crearSimulador();
    simulador.registrarProceso(new Proceso(1, 100, 3));
    simulador.registrarProceso(new Proceso(2, 100, 3));

    simulador.ejecutarTick();

    expect(simulador.pidEnCpu).toBe(1);
    expect(simulador.obtenerEstado(1)).toBe(EstadoProceso.EJECUTANDO);
    expect(simulador.obtenerPidsListos()).toEqual([2]);
  });
  
  it('al terminar su CPU pasa a TERMINADO y libera la CPU y la memoria', () => {
    const simulador = crearSimulador(1000);
    simulador.registrarProceso(new Proceso(1, 100, 2));

    simulador.ejecutarTick();
    simulador.ejecutarTick();

    expect(simulador.obtenerEstado(1)).toBe(EstadoProceso.TERMINADO);
    expect(simulador.pidEnCpu).toBeNull();
    expect(simulador.obtenerMapaMemoria()).toEqual([{ inicio: 0, tamanio: 1000, pid: null }]);
  });

  it('guarda en el historial qué proceso usó la CPU en cada tick', () => {
    const simulador = crearSimulador(1000);
    simulador.registrarProceso(new Proceso(1, 600, 1));
    simulador.registrarProceso(new Proceso(2, 600, 1));

    simulador.ejecutarTick();
    simulador.ejecutarTick();
    simulador.ejecutarTick();

    expect(simulador.obtenerHistorialCpu()).toEqual([1, 2, null]);
  });
});

describe('Simulador - Round-Robin', () => {
  it('al agotar el quantum con otros listos, expropia y cuenta un cambio de contexto', () => {
    const simulador = crearSimulador(1000, 2);
    simulador.registrarProceso(new Proceso(1, 100, 3));
    simulador.registrarProceso(new Proceso(2, 100, 3));

    for (let i = 0; i < 6; i++) simulador.ejecutarTick();

    expect(simulador.obtenerHistorialCpu()).toEqual([1, 1, 2, 2, 1, 2]);
    expect(simulador.obtenerCambiosContexto()).toBe(2);
  });
  
  it('caso mínimo de la consigna: Q = 2, P1 con CPU 3 y P2 con CPU 2 ejecutan P1, P1, P2, P2, P1', () => {
    const simulador = crearSimulador(1000, 2);
    simulador.registrarProceso(new Proceso(1, 100, 3));
    simulador.registrarProceso(new Proceso(2, 100, 2));

    simulador.ejecutarHastaTerminar();

    expect(simulador.obtenerHistorialCpu()).toEqual([1, 1, 2, 2, 1]);
    expect(simulador.obtenerCambiosContexto()).toBe(1);
  });

  it('al agotar el quantum sin otros listos, renueva sin cambio de contexto', () => {
    const simulador = crearSimulador(1000, 1);
    simulador.registrarProceso(new Proceso(1, 100, 3));

    for (let i = 0; i < 3; i++) simulador.ejecutarTick();

    expect(simulador.obtenerHistorialCpu()).toEqual([1, 1, 1]);
    expect(simulador.obtenerCambiosContexto()).toBe(0);
  });
  });

describe('Simulador - fase 2: Entrada/Salida', () => {
  it('bloquea al proceso en su E/S, conserva su memoria y cuenta un cambio de contexto', () => {
    const simulador = crearSimulador(1000, 3);
    simulador.registrarProceso(new Proceso(1, 100, 3, new EventoES(1, 2)));
    simulador.registrarProceso(new Proceso(2, 100, 2));

    simulador.ejecutarTick();

    expect(simulador.obtenerEstado(1)).toBe(EstadoProceso.BLOQUEADO);
    expect(simulador.obtenerPidsBloqueados()).toEqual([1]);
    expect(simulador.obtenerMapaMemoria()[0]).toEqual({ inicio: 0, tamanio: 100, pid: 1 });
    expect(simulador.obtenerCambiosContexto()).toBe(1);
  });

  it('al terminar la E/S vuelve al final de la cola de listos', () => {
    const simulador = crearSimulador(1000, 3);
    simulador.registrarProceso(new Proceso(1, 100, 3, new EventoES(1, 2)));
    simulador.registrarProceso(new Proceso(2, 100, 2));

    for (let i = 0; i < 5; i++) simulador.ejecutarTick();

    expect(simulador.obtenerHistorialCpu()).toEqual([1, 2, 2, 1, 1]);
    expect(simulador.obtenerEstado(1)).toBe(EstadoProceso.TERMINADO);
  });
});

describe('Simulador - fase 4: métricas y fin de la simulación', () => {
  it('el uso de CPU es 0 % en el tick 0 y después el porcentaje de ticks ocupados', () => {
    const simulador = crearSimulador();
    expect(simulador.calcularUsoCpu()).toBe(0);
    simulador.registrarProceso(new Proceso(1, 100, 3));

    for (let i = 0; i < 4; i++) simulador.ejecutarTick();

    expect(simulador.calcularUsoCpu()).toBe(75);
  });

  it('ejecuta hasta que todos los procesos terminan', () => {
    const simulador = crearSimulador(1000, 2);
    simulador.registrarProceso(new Proceso(1, 100, 3));
    simulador.registrarProceso(new Proceso(2, 100, 2));
    expect(simulador.haTerminado()).toBe(false);

    simulador.ejecutarHastaTerminar();

    expect(simulador.haTerminado()).toBe(true);
    expect(simulador.reloj).toBe(5);
    expect(simulador.calcularFragmentacionExterna()).toBe(0);
  });
});

describe('Simulador - consulta del estado (RF10)', () => {
  it('devuelve los PID de los procesos terminados, en orden de registro', () => {
    const simulador = crearSimulador(1000, 2);
    simulador.registrarProceso(new Proceso(1, 100, 3));
    simulador.registrarProceso(new Proceso(2, 100, 2));
    expect(simulador.obtenerPidsTerminados()).toEqual([]);

    for (let i = 0; i < 4; i++) simulador.ejecutarTick();
    expect(simulador.obtenerPidsTerminados()).toEqual([2]);

    simulador.ejecutarTick();
    expect(simulador.obtenerPidsTerminados()).toEqual([1, 2]);
  });
});

describe('Simulador - escenario completo', () => {
  it('combina espera de memoria, fragmentación externa, E/S y Round-Robin', () => {
    const simulador = crearSimulador(1000, 2);
    simulador.registrarProceso(new Proceso(1, 400, 4, new EventoES(2, 2)));
    simulador.registrarProceso(new Proceso(2, 300, 3));
    simulador.registrarProceso(new Proceso(3, 500, 2));

    for (let i = 0; i < 6; i++) simulador.ejecutarTick();

    expect(simulador.obtenerPidsEsperandoMemoria()).toEqual([3]);
    expect(simulador.obtenerMapaMemoria()).toEqual([
      { inicio: 0, tamanio: 400, pid: null },
      { inicio: 400, tamanio: 300, pid: 2 },
      { inicio: 700, tamanio: 300, pid: null },
    ]);
    expect(simulador.calcularFragmentacionExterna()).toBeCloseTo(42.86, 2);

    simulador.ejecutarHastaTerminar();

    expect(simulador.obtenerHistorialCpu()).toEqual([1, 1, 2, 2, 1, 1, 2, 3, 3]);
    expect(simulador.obtenerCambiosContexto()).toBe(2);
    expect(simulador.calcularUsoCpu()).toBe(100);
    expect(simulador.reloj).toBe(9);
  });
});