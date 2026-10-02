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

describe('Memoria: asignación (RF04)', () => {
  it('asigna con ajuste exacto sin generar un bloque de tamaño 0', () => {
    const memoria = new Memoria(300, new FirstFit());

    expect(memoria.asignar(1, 300)).toBe(true);

    expect(memoria.obtenerMapa()).toEqual([{ inicio: 0, tamanio: 300, pid: 1 }]);
    expect(memoria.tieneAsignado(1)).toBe(true);
  });

  it('si no hay un hueco suficiente falla sin modificar los bloques', () => {
    const memoria = new Memoria(300, new FirstFit());
    const antes = memoria.obtenerMapa();

    expect(memoria.asignar(2, 500)).toBe(false);
    expect(memoria.obtenerMapa()).toEqual(antes);
    expect(memoria.tieneAsignado(2)).toBe(false);
  });
  
  it('divide el bloque cuando sobra espacio', () => {
    const memoria = new Memoria(1024, new FirstFit());

    memoria.asignar(1, 100);

    expect(memoria.obtenerMapa()).toEqual([
      { inicio: 0, tamanio: 100, pid: 1 },
      { inicio: 100, tamanio: 924, pid: null },
    ]);
  });

  it('rechaza asignar dos veces al mismo proceso', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 100);

    expect(() => memoria.asignar(1, 50)).toThrow();
  });

  it('rechaza un tamaño pedido inválido', () => {
    const memoria = new Memoria(1024, new FirstFit());

    expect(() => memoria.asignar(1, 0)).toThrow();
  });
});

describe('Memoria: liberación y coalescencia (RF05)', () => {
  it('libera el bloque de un proceso; si los vecinos están ocupados no fusiona', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);

    memoria.liberar(2);

    expect(memoria.tieneAsignado(2)).toBe(false);
    expect(memoria.obtenerMapa()).toEqual([
      { inicio: 0, tamanio: 100, pid: 1 },
      { inicio: 100, tamanio: 100, pid: null },
      { inicio: 200, tamanio: 100, pid: 3 },
      { inicio: 300, tamanio: 724, pid: null },
    ]);
  });

  it('rechaza liberar un proceso que no tiene memoria', () => {
    const memoria = new Memoria(1024, new FirstFit());

    expect(() => memoria.liberar(9)).toThrow();
  });
});
}); 