export interface IMetricas {
  readonly ticksTotales: number;
  readonly ticksCpuOcupada: number;
  registrarTick(cpuOcupada: boolean): void;
}