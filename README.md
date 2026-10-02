# Simulador de procesos y memoria

![Tests](https://github.com/MartinaAcostaa/Simulador-de-proceso-y-memoria/actions/workflows/tests.yml/badge.svg)

Este proyecto es mi trabajo para la AE2 intercátedra de **Sistemas Operativos** y **Paradigmas y Lenguajes de Programación II** (Universidad de la Cuenca del Plata).

La idea fue armar en TypeScript un simulador de cómo un sistema operativo maneja los procesos y la memoria. Simula:

- el ciclo de vida de un proceso, desde que se crea hasta que termina;
- la planificación de la CPU con **Round-Robin**;
- los bloqueos por **Entrada/Salida**;
- la memoria con **asignación contigua**, usando First-Fit, Best-Fit o Worst-Fit, uniendo huecos libres (coalescencia) y calculando la fragmentación externa.

No es un programa que se ejecuta: es una **biblioteca de clases**. No tiene `main` ni menú por consola. Para comprobar que funciona, escribí **tests con Vitest**, y todo el desarrollo lo hice con TDD: primero el test y después el código.

## Cómo probarlo

Necesitás tener Node.js (versión 20 o más nueva). Después:

```bash
git clone https://github.com/MartinaAcostaa/Simulador-de-proceso-y-memoria.git
cd Simulador-de-proceso-y-memoria
npm install
```

Y para correrlo:

- `npm test` corre todos los tests.
- `npm run coverage` corre los tests y muestra la cobertura. El reporte completo queda en la carpeta `coverage/`.
- `npm run typecheck` revisa que no haya errores de tipos.

Además configuré **GitHub Actions** para que, cada vez que subo cambios, se instale todo y se corran el chequeo de tipos y los tests automáticamente. El badge de arriba muestra si el último push pasó. 