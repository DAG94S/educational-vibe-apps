# Plan — Visualizador de Algoritmos de Ordenamiento

**Área:** Estructuras de Datos / Programación (Ingeniería de Software)
**Referente:** VisuAlgo — https://visualgo.net + USFCA — https://www.cs.usfca.edu/~galles/visualization/Algorithms.html
**Estado:** 📝 Planificado

---

## Concepto a enseñar

Cómo funcionan internamente los algoritmos de ordenamiento (Bubble, Selection,
Insertion, Merge, Quick) y por qué su costo (Big O) difiere. Ver las comparaciones
e intercambios paso a paso.

## Objetivo pedagógico

Que el estudiante VEA el algoritmo "caminar" — comparaciones e intercambios — en lugar
de leer pseudocódigo estático. Conectar el comportamiento visual con la complejidad.

## Qué controla el usuario (inputs)

- Dropdown de **algoritmo** (Bubble / Selection / Insertion / Merge / Quick)
- Slider de **tamaño del arreglo**
- Slider de **velocidad** de animación
- Botones **Generar arreglo / Ordenar / Pausar / Paso a paso / Reiniciar**

## Qué observa (outputs en vivo)

- Barras de altura proporcional al valor, coloreadas por estado
  (comparando, intercambiando, ordenado)
- Contadores en vivo: comparaciones y swaps
- Etiqueta de complejidad Big O del algoritmo elegido

## Stack y técnica

- HTML/CSS/JS vanilla, un solo `index.html`
- **HTML5 Canvas** o barras con `<div>` + CSS
- **Patrón clave:** separar el motor del algoritmo (que emite "pasos") del renderizado.
  El algoritmo genera una lista de operaciones; el render las reproduce.

## Qué le robamos al referente

- Controles **play / pausa / paso / velocidad** (lo esencial de VisuAlgo)
- Código del algoritmo separado de la animación (lección de arquitectura)

## Checklist de entrega

- [ ] `index.html` funcional sin servidor
- [ ] Responsivo (probar a 320px)
- [ ] Instrucción de uso visible dentro de la app
- [ ] `README.md` con descripción + snippet de embebido
