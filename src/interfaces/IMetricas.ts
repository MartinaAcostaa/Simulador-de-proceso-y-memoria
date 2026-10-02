export interface IMetricas {
  readonly ticksTotales: number;
  readonly ticksCpuOcupada: number;
  readonly cambiosContexto: number;
  registrarTick(cpuOcupada: boolean): void;
  registrarCambioContexto(): void;
  calcularUsoCpu(): number;
}