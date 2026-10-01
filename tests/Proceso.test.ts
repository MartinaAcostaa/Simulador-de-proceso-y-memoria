import { describe, it, expect } from 'vitest';
import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

describe('Proceso', () => {
  it('se crea en estado NUEVO con la CPU restante igual a la total', () => {
    const proceso = new Proceso(1, 100, 5);

    expect(proceso.estado).toBe(EstadoProceso.NUEVO);
    expect(proceso.tiempoCpuRestante).toBe(5);
  });
});




