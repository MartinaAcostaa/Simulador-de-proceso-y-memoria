import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';

describe('BloqueMemoria', () => {
  it('se crea libre, con su inicio, tamaño y fin', () => {
    const bloque = new BloqueMemoria(100, 300);

    expect(bloque.inicio).toBe(100);
    expect(bloque.tamanio).toBe(300);
    expect(bloque.fin).toBe(400);
    expect(bloque.pid).toBe(null);
    expect(bloque.estaLibre()).toBe(true);
  });

  it('acepta empezar en la dirección 0', () => {
    const bloque = new BloqueMemoria(0, 1024);

    expect(bloque.inicio).toBe(0);
    expect(bloque.fin).toBe(1024);
  });

  it('rechaza un inicio negativo o decimal', () => {
    expect(() => new BloqueMemoria(-1, 100)).toThrow();
    expect(() => new BloqueMemoria(1.5, 100)).toThrow();
  });

  it('rechaza un tamaño que no sea entero positivo', () => {
    expect(() => new BloqueMemoria(0, 0)).toThrow();
    expect(() => new BloqueMemoria(0, -50)).toThrow();
    expect(() => new BloqueMemoria(0, 10.5)).toThrow();
  });

  it('al ocuparse guarda el PID y deja de estar libre', () => {
    const bloque = new BloqueMemoria(0, 100);

    bloque.ocupar(7);

    expect(bloque.pid).toBe(7);
    expect(bloque.estaLibre()).toBe(false);
  });

  it('no puede ocuparse si ya está ocupado', () => {
    const bloque = new BloqueMemoria(0, 100);
    bloque.ocupar(7);

    expect(() => bloque.ocupar(8)).toThrow();
  });

  it('rechaza ocuparse con un PID inválido', () => {
    const bloque = new BloqueMemoria(0, 100);

    expect(() => bloque.ocupar(0)).toThrow();
  });

  it('al liberarse vuelve a estar libre', () => {
    const bloque = new BloqueMemoria(0, 100);
    bloque.ocupar(7);

    bloque.liberar();

    expect(bloque.pid).toBe(null);
    expect(bloque.estaLibre()).toBe(true);
  });

  it('no puede liberarse si ya está libre', () => {
    const bloque = new BloqueMemoria(0, 100);

    expect(() => bloque.liberar()).toThrow();
  });
});