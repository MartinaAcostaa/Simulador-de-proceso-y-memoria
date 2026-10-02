import { IMetricas } from '../interfaces/IMetricas';

export class Metricas implements IMetricas {
  private _ticksTotales = 0;
  private _ticksCpuOcupada = 0;
  private _cambiosContexto = 0;

  get ticksTotales(): number {
    return this._ticksTotales;
  }

  get ticksCpuOcupada(): number {
    return this._ticksCpuOcupada;
  }

  get cambiosContexto(): number {
    return this._cambiosContexto;
  }

  registrarTick(cpuOcupada: boolean): void {
    this._ticksTotales++;
    if (cpuOcupada) {
      this._ticksCpuOcupada++;
    }
  }

  registrarCambioContexto(): void {
    this._cambiosContexto++;
  }

  calcularUsoCpu(): number {
    if (this._ticksTotales === 0) {
      return 0;
    }
    return (100 * this._ticksCpuOcupada) / this._ticksTotales;
  }
}