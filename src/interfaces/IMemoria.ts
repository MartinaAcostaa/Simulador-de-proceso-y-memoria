export interface InfoBloque {
  readonly inicio: number;
  readonly tamanio: number;
  readonly pid: number | null;
}

export interface IMemoria {
  readonly tamanioTotal: number;
  readonly nombreEstrategia: string;

  obtenerMapa(): InfoBloque[];
  asignar(pid: number, tamanio: number): boolean;
  tieneAsignado(pid: number): boolean;
}

