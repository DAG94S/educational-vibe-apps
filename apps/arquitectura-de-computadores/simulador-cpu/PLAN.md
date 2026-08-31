# Plan — Simulador de CPU (ciclo Fetch-Decode-Execute)

**Área:** Arquitectura de Computadores (Ingeniería de Software)
**Referente:** CS Visualizer — https://cs-visualizer.com (ASM 8086 step view)
**Estado:** 📝 Planificado

---

## Concepto a enseñar

El ciclo de instrucción de una CPU: **Fetch → Decode → Execute**. Cómo una instrucción
de ensamblador mueve datos entre registros y memoria, y cómo cambian los flags.

## Objetivo pedagógico

Hacer visible "lo invisible": qué ocurre dentro del procesador en cada ciclo de reloj.
Que el estudiante deje de ver el ensamblador como texto y lo vea como movimiento de datos.

## Qué controla el usuario (inputs)

- Área de texto para escribir un **programa simple** (set reducido: MOV, ADD, SUB, JMP, CMP)
- Botones **Ejecutar / Paso a paso / Reiniciar**
- Slider de **velocidad** del reloj

## Qué observa (outputs en vivo)

- Tabla de **registros** (AX, BX, CX, DX, PC...) actualizándose
- Vista de **memoria** con la celda activa resaltada
- **Flags** (Zero, Carry, Sign) cambiando
- Resaltado de la instrucción en ejecución y la fase del ciclo (Fetch/Decode/Execute)

## Stack y técnica

- HTML/CSS/JS vanilla, un solo `index.html`
- DOM + CSS para registros, memoria y flags (tablas/grids); sin Canvas necesario
- **Patrón clave:** un "motor de CPU" puro (parser + ejecutor) separado de la vista.
  El motor expone el estado; la UI lo dibuja.

## Qué le robamos al referente

- Paso a paso con estado completo visible (registros + memoria + flags)
- Resaltar la fase del ciclo para anclar el concepto

## Checklist de entrega

- [ ] `index.html` funcional sin servidor
- [ ] Responsivo (probar a 320px)
- [ ] Instrucción de uso visible dentro de la app
- [ ] `README.md` con descripción + snippet de embebido
