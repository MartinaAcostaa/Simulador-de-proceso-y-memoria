import { describe, it, expect } from 'vitest';
import { GestorES } from '../src/planificacion/GestorES';

describe('GestorES - bloqueados', () => {
  it('arranca sin procesos bloqueados', () => {
    const gestor = new GestorES();

    expect(gestor.hayBloqueados()).toBe(false);
    expect(gestor.obtenerPidsBloqueados()).toEqual([]);
  });
});