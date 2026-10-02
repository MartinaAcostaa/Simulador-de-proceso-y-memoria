import { describe, it, expect } from 'vitest';
import { Memoria } from '../src/memoria/Memoria';
import { FirstFit } from '../src/memoria/FirstFit';

describe('Memoria: creación (RF01)', () => {
  it('guarda el tamaño total y el nombre de la estrategia', () => {
    const memoria = new Memoria(1024, new FirstFit());

    expect(memoria.tamanioTotal).toBe(1024);
    expect(memoria.nombreEstrategia).toBe('First-Fit');
  });

  it('rechaza un tamaño total inválido', () => {
    expect(() => new Memoria(0, new FirstFit())).toThrow();
    expect(() => new Memoria(-1024, new FirstFit())).toThrow();
    expect(() => new Memoria(10.5, new FirstFit())).toThrow();
  });
});