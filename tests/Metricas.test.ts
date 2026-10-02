import { describe, it, expect } from 'vitest';
import { Metricas } from '../src/simulacion/Metricas';

describe('Metricas - ticks', () => {
  it('arranca sin ticks registrados', () => {
    const metricas = new Metricas();

    expect(metricas.ticksTotales).toBe(0);
    expect(metricas.ticksCpuOcupada).toBe(0);
  });

  it('cuenta los ticks totales y los ticks con la CPU ocupada', () => {
    const metricas = new Metricas();

    metricas.registrarTick(true);
    metricas.registrarTick(false);
    metricas.registrarTick(true);

    expect(metricas.ticksTotales).toBe(3);
    expect(metricas.ticksCpuOcupada).toBe(2);
  });
});