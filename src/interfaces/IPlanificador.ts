export interface IPlanificador {
  readonly quantum: number;
  hayListos(): boolean;
  obtenerPidsListos(): number[];
}