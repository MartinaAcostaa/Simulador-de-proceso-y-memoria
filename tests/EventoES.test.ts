import { describe, it, expect } from 'vitest';
import { EventoES } from '../src/procesos/EventoES';

describe('EventoES', () => {
  it('guarda después de cuántos ticks de CPU se dispara y cuánto dura', () => {
    const evento = new EventoES(2, 3);

    expect(evento.despuesDeTicksCpu).toBe(2);
    expect(evento.duracion).toBe(3);
  });

  it('rechaza un disparo que no sea entero positivo', () => {
    expect(() => new EventoES(0, 3)).toThrow();
    expect(() => new EventoES(-2, 3)).toThrow();
    expect(() => new EventoES(1.5, 3)).toThrow();
  });

  it('rechaza una duración que no sea entero positivo', () => {
    expect(() => new EventoES(2, 0)).toThrow();
    expect(() => new EventoES(2, -3)).toThrow();
    expect(() => new EventoES(2, 1.5)).toThrow();
  });
});