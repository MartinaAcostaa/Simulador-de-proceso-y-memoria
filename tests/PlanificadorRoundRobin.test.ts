import { describe, it, expect } from 'vitest';
import { PlanificadorRoundRobin } from '../src/planificacion/PlanificadorRoundRobin';

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
});