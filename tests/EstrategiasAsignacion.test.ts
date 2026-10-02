import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';
import { FirstFit } from '../src/memoria/FirstFit';
import { BestFit } from '../src/memoria/BestFit';
import { WorstFit } from '../src/memoria/WorstFit';
import { IEstrategiaAsignacion } from '../src/interfaces/IEstrategiaAsignacion';

function bloque(inicio: number, tamanio: number, pid?: number): BloqueMemoria {
  const nuevo = new BloqueMemoria(inicio, tamanio);
  if (pid !== undefined) {
    nuevo.ocupar(pid);
  }
  return nuevo;
}

function crearMemoriaDePrueba(): BloqueMemoria[] {
  return [
    bloque(0, 100, 1),
    bloque(100, 250),
    bloque(350, 150, 2),
    bloque(500, 150),
    bloque(650, 74, 3),
    bloque(724, 300),
  ];
}

describe('Estrategias de asignación', () => {
  it('First-Fit elige el primer hueco donde entra', () => {
    expect(new FirstFit().elegirBloque(crearMemoriaDePrueba(), 120)).toBe(1);
  });

  it('Best-Fit elige el hueco más chico donde entra', () => {
    expect(new BestFit().elegirBloque(crearMemoriaDePrueba(), 120)).toBe(3);
  });

  it('Worst-Fit elige el hueco más grande', () => {
    expect(new WorstFit().elegirBloque(crearMemoriaDePrueba(), 120)).toBe(5);
  });

  it('Best-Fit prefiere un ajuste exacto', () => {
    expect(new BestFit().elegirBloque(crearMemoriaDePrueba(), 150)).toBe(3);
  });

  it('ante un empate de tamaño, Best-Fit y Worst-Fit eligen la menor dirección', () => {
    const bloques = [bloque(0, 200), bloque(200, 100, 1), bloque(300, 200)];

    expect(new BestFit().elegirBloque(bloques, 50)).toBe(0);
    expect(new WorstFit().elegirBloque(bloques, 50)).toBe(0);
  });


  const estrategias: IEstrategiaAsignacion[] = [new FirstFit(), new BestFit(), new WorstFit()];

  for (const estrategia of estrategias) {
    it(`${estrategia.nombre} devuelve -1 si ningún hueco alcanza, aunque la suma libre sí alcance`, () => {
      expect(estrategia.elegirBloque(crearMemoriaDePrueba(), 400)).toBe(-1);
    });

    it(`${estrategia.nombre} nunca elige un bloque ocupado`, () => {
      const bloques = [bloque(0, 500, 1), bloque(500, 100)];

      expect(estrategia.elegirBloque(bloques, 50)).toBe(1);
    });

    it(`${estrategia.nombre} rechaza un tamaño pedido inválido`, () => {
      expect(() => estrategia.elegirBloque(crearMemoriaDePrueba(), 0)).toThrow();
    });
  }

  it('cada estrategia tiene su nombre', () => {
    expect(estrategias.map((e) => e.nombre)).toEqual(['First-Fit', 'Best-Fit', 'Worst-Fit']);
  });
});