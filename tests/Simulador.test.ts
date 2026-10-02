import { describe, it, expect } from 'vitest';
import { Simulador } from '../src/simulacion/Simulador';
import { Memoria } from '../src/memoria/Memoria';
import { FirstFit } from '../src/memoria/FirstFit';
import { PlanificadorRoundRobin } from '../src/planificacion/PlanificadorRoundRobin';

function crearSimulador(memoria = 1000, quantum = 2): Simulador {
  return new Simulador(new Memoria(memoria, new FirstFit()), new PlanificadorRoundRobin(quantum));
}

describe('Simulador - creación', () => {
  it('arranca sin procesos listos y con toda la memoria libre', () => {
    const simulador = crearSimulador(1000);

    expect(simulador.obtenerPidsListos()).toEqual([]);
    expect(simulador.obtenerMapaMemoria()).toEqual([{ inicio: 0, tamanio: 1000, pid: null }]);
  });
});