export interface IGestorES {
  hayBloqueados(): boolean;
  obtenerPidsBloqueados(): number[];
}