# Plan — Visualizador de Índice B-Tree

**Área:** Bases de Datos (Ingeniería de Software)
**Referente:** database-internals-visualized — https://github.com/PatrickKoss/database-internals-visualized
**Estado:** 📝 Planificado

---

## Concepto a enseñar

Cómo un índice B-Tree mantiene los datos ordenados y balanceados para que las búsquedas
sean O(log n). Ver cómo un nodo se **divide (split)** y cómo se promueve una clave al
insertar, y por qué eso evita recorrer toda la tabla.

## Objetivo pedagógico

Que el estudiante entienda QUÉ pasa cuando crea un `INDEX` en SQL, y por qué acelera las
consultas. Conectar el concepto abstracto de "índice" con una estructura visible.

## Qué controla el usuario (inputs)

- Input numérico + botón **Insertar clave**
- Botón **Buscar clave** (resalta el camino de búsqueda)
- Botón **Eliminar clave**
- Selector del **orden del árbol** (grado máximo de un nodo)
- Botón **Reiniciar**

## Qué observa (outputs en vivo)

- El árbol dibujado, reacomodándose al insertar/eliminar
- Animación del **split** de nodos y promoción de claves
- Resaltado del **camino de búsqueda** raíz → hoja
- Contador de comparaciones por operación (evidencia del O(log n))

## Stack y técnica

- HTML/CSS/JS vanilla, un solo `index.html`
- **HTML5 Canvas** o **SVG** para el árbol
- **Patrón clave (lo más valioso del referente):** el motor del B-Tree no sabe dibujar.
  La lógica de inserción/split es pura y testeable; el render solo refleja el estado.

## Qué le robamos al referente

- Lógica separada del render (arquitectura limpia y testeable)
- Animación paso a paso del split (el momento "ajá" del B-Tree)

## Checklist de entrega

- [ ] `index.html` funcional sin servidor
- [ ] Responsivo (probar a 320px)
- [ ] Instrucción de uso visible dentro de la app
- [ ] `README.md` con descripción + snippet de embebido
