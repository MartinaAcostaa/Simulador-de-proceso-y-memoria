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
  
  it('empieza con un único bloque libre del tamaño total', () => {
    const memoria = new Memoria(1024, new FirstFit());

    expect(memoria.obtenerMapa()).toEqual([{ inicio: 0, tamanio: 1024, pid: null }]);
  });

  it('el mapa es una copia: modificarlo no altera la memoria', () => {
    const memoria = new Memoria(1024, new FirstFit());
    const mapa = memoria.obtenerMapa();

    mapa.push({ inicio: 999, tamanio: 1, pid: 7 });

    expect(memoria.obtenerMapa()).toHaveLength(1);
  });
});