# AulaLab: ¿Qué pasaría si…?

## Qué enseña

AulaLab es un micro-recurso demostrativo para el primer día del curso. Muestra cómo convertir un concepto de una asignatura en una experiencia interactiva con variables, visualización, evidencia y una pregunta de transferencia.

## Cómo se usa

1. Selecciona un escenario: Movimiento, Decisiones, Reacciones o Aprendizaje.
2. Mueve una o más variables.
3. Observa cómo cambian la visualización y las métricas.
4. Lee la evidencia y la interpretación.
5. Pulsa **Revisar mi hipótesis** para obtener retroalimentación.

## Arquitectura

- Un solo `index.html`.
- HTML, CSS y JavaScript vanilla.
- Sin dependencias ni backend.
- Canvas para la visualización animada.
- `localStorage` para conservar la última exploración.
- Responsive y compatible con enlace directo o embebido en Moodle.

## Idea pedagógica

La aplicación no pretende sustituir al docente ni demostrar una ley completa. Su objetivo es mostrar el patrón reutilizable:

> pregunta → variable → observación → evidencia → reto

Los escenarios son ilustrativos. En el curso, el docente reemplaza las variables, las fuentes, la explicación y el reto por contenidos de su asignatura.

## Uso en Moodle

```html
<iframe src="URL_DE_DESPLIEGUE" width="100%" height="760"
        style="border:0" loading="lazy"
        title="AulaLab: ¿Qué pasaría si…?"></iframe>
```

## Siguiente evolución

- Sustituir las evidencias demostrativas por fuentes reales del cuaderno documental.
- Añadir una ficha de actividad para estudiantes.
- Crear una skill que ayude a adaptar el escenario a una asignatura.
- Incorporar más variables o un gráfico específico del dominio.
