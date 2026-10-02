export interface IBloqueMemoria {
  readonly inicio: number;
  readonly tamanio: number;
  readonly fin: number;
  readonly pid: number | null;

  estaLibre(): boolean;
  ocupar(pid: number): void;
  liberar(): void;
}
