import { describe, it, expect } from 'vitest';
import { Memoria } from '../src/memoria/Memoria';
import { FirstFit } from '../src/memoria/FirstFit';
import { BestFit } from '../src/memoria/BestFit';
import { WorstFit } from '../src/memoria/WorstFit';
import { IEstrategiaAsignacion } from '../src/interfaces/IEstrategiaAsignacion';

function verificarInvariantes(memoria: Memoria): void {
  let direccionEsperada = 0;
  for (const bloque of memoria.obtenerMapa()) {
    expect(bloque.inicio).toBe(direccionEsperada);
    expect(bloque.tamanio).toBeGreaterThan(0);
    direccionEsperada = bloque.inicio + bloque.tamanio;
  }
  expect(direccionEsperada).toBe(memoria.tamanioTotal);
}

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

  const casos: [IEstrategiaAsignacion, number][] = [
    [new FirstFit(), 0],
    [new BestFit(), 300],
    [new WorstFit(), 500],
  ];

  for (const [estrategia, inicioEsperado] of casos) {
    it(`con ${estrategia.nombre} un proceso de 90 KB va a la dirección ${inicioEsperado}`, () => {
      const memoria = new Memoria(1024, estrategia);
      memoria.asignar(1, 200);
      memoria.asignar(2, 100);
      memoria.asignar(3, 100);
      memoria.asignar(4, 100);
      memoria.liberar(1);   
      memoria.liberar(3);  

      memoria.asignar(5, 90);

      const bloqueP5 = memoria.obtenerMapa().find((bloque) => bloque.pid === 5);
      expect(bloqueP5?.inicio).toBe(inicioEsperado);
      verificarInvariantes(memoria);
    });
  }
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

  it('fusiona con el vecino derecho libre', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 100);
    memoria.asignar(2, 100);   

    memoria.liberar(2);

    expect(memoria.obtenerMapa()).toEqual([
      { inicio: 0, tamanio: 100, pid: 1 },
      { inicio: 100, tamanio: 924, pid: null },
    ]);
  });

  it('fusiona con el vecino izquierdo libre', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);
    memoria.liberar(1);        

    memoria.liberar(2);

    expect(memoria.obtenerMapa()).toEqual([
      { inicio: 0, tamanio: 200, pid: null },
      { inicio: 200, tamanio: 100, pid: 3 },
      { inicio: 300, tamanio: 724, pid: null },
    ]);
  });

  it('fusiona con los dos vecinos a la vez', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 100);
    memoria.asignar(2, 100);
    memoria.asignar(3, 100);
    memoria.liberar(1);        
    memoria.liberar(3);       

    memoria.liberar(2);

    expect(memoria.obtenerMapa()).toEqual([{ inicio: 0, tamanio: 1024, pid: null }]);
  });

  it('al liberar todos los procesos queda un único bloque libre y se puede reutilizar', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 300);
    memoria.asignar(2, 200);
    memoria.asignar(3, 524);
    expect(memoria.asignar(4, 100)).toBe(false);   

    memoria.liberar(2);
    memoria.liberar(1);
    memoria.liberar(3);

    expect(memoria.obtenerMapa()).toEqual([{ inicio: 0, tamanio: 1024, pid: null }]);
    expect(memoria.asignar(4, 100)).toBe(true);
  });
  
describe('Memoria: métricas (RF09)', () => {
  it('memoria vacía: todo libre y ocupación 0%', () => {
    const memoria = new Memoria(1024, new FirstFit());

    expect(memoria.calcularMemoriaLibre()).toBe(1024);
    expect(memoria.calcularMemoriaOcupada()).toBe(0);
    expect(memoria.calcularOcupacion()).toBe(0);
  });

  it('memoria llena: libre 0 y ocupación 100%', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 1024);

    expect(memoria.calcularMemoriaLibre()).toBe(0);
    expect(memoria.calcularOcupacion()).toBe(100);
  });
  
  it('huecos no contiguos de 100 y 300 KB: libre 400, mayor 300 y fragmentación 25%', () => {
    const memoria = new Memoria(1024, new FirstFit());
    memoria.asignar(1, 100);
    memoria.asignar(2, 200);
    memoria.asignar(3, 300);
    memoria.asignar(4, 424);  
    memoria.liberar(1);        
    memoria.liberar(3);       

    expect(memoria.calcularMemoriaLibre()).toBe(400);
    expect(memoria.calcularMayorBloqueLibre()).toBe(300);
    expect(memoria.calcularFragmentacionExterna()).toBe(25);
    expect(memoria.calcularOcupacion()).toBeCloseTo(60.94, 2);
  });

  it('sin fragmentación con un solo hueco, y 0% con la memoria llena', () => {
    const vacia = new Memoria(1024, new FirstFit());
    const llena = new Memoria(1024, new FirstFit());
    llena.asignar(1, 1024);

    expect(vacia.calcularMayorBloqueLibre()).toBe(1024);
    expect(vacia.calcularFragmentacionExterna()).toBe(0);
    expect(llena.calcularMayorBloqueLibre()).toBe(0);
    expect(llena.calcularFragmentacionExterna()).toBe(0);
  });
});
});