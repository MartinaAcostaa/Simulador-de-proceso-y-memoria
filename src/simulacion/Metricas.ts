import { IMetricas } from '../interfaces/IMetricas';

export class Metricas implements IMetricas {
  private _ticksTotales = 0;
  private _ticksCpuOcupada = 0;

  get ticksTotales(): number {
    return this._ticksTotales;
  }

  get ticksCpuOcupada(): number {
    return this._ticksCpuOcupada;
  }

  registrarTick(cpuOcupada: boolean): void {
    this._ticksTotales++;
    if (cpuOcupada) {
      this._ticksCpuOcupada++;
    }
  }
}