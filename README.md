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

Necesario tener Node.js (versión 20 o más nueva). Después:

```
git clone https://github.com/MartinaAcostaa/Simulador-de-proceso-y-memoria.git
cd Simulador-de-proceso-y-memoria
npm install
```

Y para correrlo:

- `npm test` corre todos los tests.
- `npm run coverage` corre los tests y muestra la cobertura. El reporte completo queda en la carpeta `coverage/`.
- `npm run typecheck` revisa que no haya errores de tipos.

Además configuré **GitHub Actions** para que, cada vez que subo cambios, se instale todo y se corran el chequeo de tipos y los tests automáticamente. El badge de arriba muestra si el último push pasó. 

## Cómo está organizado

```
src/
├─ interfaces/     las interfaces de todas las clases
├─ procesos/       Proceso, EventoES y los estados
├─ memoria/        los bloques, la memoria y las estrategias
├─ planificacion/  el planificador Round-Robin y el gestor de E/S
├─ simulacion/     el Simulador y las métricas
└─ validaciones/   validaciones que comparten varias clases
tests/             un archivo de tests por clase
```

Cada clase se encarga de una sola cosa:

- **Proceso** guarda su estado y solo deja hacer los cambios de estado válidos. También lleva la cuenta de cuánta CPU le falta y cuánto quantum usó.
- **EventoES** dice después de cuántos ticks de CPU el proceso hace su E/S y cuánto dura.
- **BloqueMemoria** es un pedazo de memoria contiguo, libre u ocupado por un proceso.
- **FirstFit, BestFit y WorstFit** eligen en qué hueco libre entra un proceso.
- **Memoria** asigna (y divide el bloque si sobra), libera (y une huecos vecinos) y calcula las métricas de memoria.
- **PlanificadorRoundRobin** maneja la cola de listos y decide qué hacer cuando se termina el quantum.
- **GestorES** maneja a los procesos bloqueados y los devuelve a listos cuando termina su E/S.
- **Metricas** cuenta los ticks, el uso de CPU y los cambios de contexto.
- **Simulador** junta todo y ejecuta cada tick en cuatro fases: admisión, E/S, CPU y métricas.

## Algunas decisiones que tomé

- **Cada clase tiene su interfaz.** Las clases se comunican a través de las interfaces y no dependen unas de otras directamente.
- **Usé doble encapsulamiento.** Los atributos son privados, se leen con getters y solo se cambian con métodos que validan. No hay setters, y cuando una clase devuelve una lista, devuelve una copia.
- **Herencia solo donde tenía sentido.** Best-Fit y Worst-Fit hacen casi lo mismo, así que heredan de una clase abstracta (`EstrategiaPorComparacion`) y cada una redefine con `override` solo la comparación. First-Fit no compara bloques, por eso no hereda.
- **Polimorfismo.** `Memoria` trabaja con cualquier estrategia sin saber cuál es, porque todas cumplen la misma interfaz.
- **Composición.** `Memoria` y `Simulador` reciben lo que necesitan por el constructor, así es fácil cambiar la estrategia o el quantum.
- **TDD y commits chicos.** Cada funcionalidad empezó con un test que fallaba, y traté de que cada commit tuviera 50 líneas o menos.