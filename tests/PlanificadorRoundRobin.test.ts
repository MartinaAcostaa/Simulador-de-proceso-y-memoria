import { describe, it, expect } from 'vitest';
import { PlanificadorRoundRobin } from '../src/planificacion/PlanificadorRoundRobin';
import { Proceso } from '../src/procesos/Proceso';

function crearListo(pid: number): Proceso {
  const proceso = new Proceso(pid, 100, 5);
  proceso.admitir();
  return proceso;
}

describe('PlanificadorRoundRobin - creación', () => {
  it('guarda el quantum y arranca sin procesos listos', () => {
    const planificador = new PlanificadorRoundRobin(2);

    expect(planificador.quantum).toBe(2);
    expect(planificador.hayListos()).toBe(false);
    expect(planificador.obtenerPidsListos()).toEqual([]);
  });

  it('no acepta un quantum que no sea entero positivo', () => {
    expect(() => new PlanificadorRoundRobin(0)).toThrow();
    expect(() => new PlanificadorRoundRobin(-1)).toThrow();
    expect(() => new PlanificadorRoundRobin(1.5)).toThrow();
  });

  describe('PlanificadorRoundRobin - agregar listos', () => {
  it('agrega los procesos al final de la cola (FIFO)', () => {
    const planificador = new PlanificadorRoundRobin(2);

    planificador.agregarListo(crearListo(1));
    planificador.agregarListo(crearListo(2));

    expect(planificador.hayListos()).toBe(true);
    expect(planificador.obtenerPidsListos()).toEqual([1, 2]);
  });

  it('no acepta un proceso que no esté LISTO', () => {
    const planificador = new PlanificadorRoundRobin(2);

    expect(() => planificador.agregarListo(new Proceso(1, 100, 5))).toThrow();
  });

  it('no acepta el mismo proceso dos veces', () => {
    const planificador = new PlanificadorRoundRobin(2);
    const proceso = crearListo(1);
    planificador.agregarListo(proceso);

    expect(() => planificador.agregarListo(proceso)).toThrow();
  });
});

describe('PlanificadorRoundRobin - tomar el siguiente', () => {
  it('entrega el primero de la cola y lo saca', () => {
    const planificador = new PlanificadorRoundRobin(2);
    planificador.agregarListo(crearListo(1));
    planificador.agregarListo(crearListo(2));

    const siguiente = planificador.tomarSiguiente();

    expect(siguiente.pid).toBe(1);
    expect(planificador.obtenerPidsListos()).toEqual([2]);
  });

  it('un proceso que vuelve a la cola queda último (rotación)', () => {
    const planificador = new PlanificadorRoundRobin(2);
    planificador.agregarListo(crearListo(1));
    planificador.agregarListo(crearListo(2));

    planificador.agregarListo(planificador.tomarSiguiente());

    expect(planificador.obtenerPidsListos()).toEqual([2, 1]);
  });

  it('da error si no hay procesos listos', () => {
    const planificador = new PlanificadorRoundRobin(2);

    expect(() => planificador.tomarSiguiente()).toThrow();
  });
});
});