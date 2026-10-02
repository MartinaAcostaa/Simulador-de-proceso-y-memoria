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

  describe('Metricas - uso de CPU', () => {
  it('es 0 % si todavía no pasó ningún tick', () => {
    expect(new Metricas().calcularUsoCpu()).toBe(0);
  });

  it('es el porcentaje de ticks con la CPU ocupada', () => {
    const metricas = new Metricas();
    metricas.registrarTick(true);
    metricas.registrarTick(false);
    metricas.registrarTick(true);
    metricas.registrarTick(true);

    expect(metricas.calcularUsoCpu()).toBe(75);
  });
});

describe('Metricas - cambios de contexto', () => {
  it('arranca en cero y suma uno por cada cambio registrado', () => {
    const metricas = new Metricas();
    expect(metricas.cambiosContexto).toBe(0);

    metricas.registrarCambioContexto();
    metricas.registrarCambioContexto();

    expect(metricas.cambiosContexto).toBe(2);
  });
});
});