# Laboratorio 3D de Tiro Parabólico

Recurso educativo interactivo de Física para explorar cómo la **velocidad inicial**,
el **ángulo** y la **gravedad** determinan una trayectoria parabólica. La escena
principal es 3D y la gráfica SVG mantiene una lectura 2D accesible de la misma
simulación.

## Qué enseña

- La composición de movimiento horizontal uniforme y movimiento vertical acelerado.
- La relación entre `v₀`, `θ`, `g`, tiempo de vuelo, alcance y altura máxima.
- La comparación entre predicción matemática, trayectoria y resultado del lanzamiento.
- El razonamiento experimental: cambiar una variable, predecir, lanzar y explicar el
  resultado con evidencia.

## Modos de aprendizaje

- **Explorar:** controles libres, trayectoria visible, vectores opcionales y métricas
  actualizadas en vivo.
- **Comprender:** fórmulas, sustitución numérica y gráfica para conectar el modelo con
  lo que se observa.
- **Desafío:** una ciudad urbana generada al azar. Cada desafío conserva su semilla,
  edificios y contador de intentos hasta pulsar **Nuevo desafío**.

## Desafío urbano

El botón **Nuevo desafío** genera una ciudad sembrada y reproducible con entre 3 y 7
edificios de **alturas variables**. El cañón y el objetivo pueden estar en el suelo o
en una azotea, por lo que el desnivel puede ser positivo o negativo. La semilla y los
datos públicos del escenario permanecen estables al reiniciar, fallar o cambiar de
modo; solo el botón dedicado crea otra ciudad.

Durante el desafío la trayectoria prevista, los vectores y la gráfica se ocultan para
que el estudiante no reciba la solución visualmente. El proyectil se evalúa con
**colisiones continuas** contra fachadas, techos, objetivo y suelo: se comprueba el
segmento entre fotogramas y el vuelo se detiene en el primer impacto. La
retroalimentación distingue objetivo alcanzado, fachada, techo, tiro corto, tiro largo
y error de altura sin revelar la velocidad o el ángulo de la solución oculta.

La solución física se usa internamente para construir escenarios resolubles y validar
que sus edificios no bloqueen la trayectoria. Nunca se muestra en la interfaz.

## Cómo se usa en clase

1. **Explicar:** presentar `vₓ`, `vᵧ`, tiempo de vuelo, alcance y altura máxima.
2. **Explorar:** pedir predicciones con Tierra, Luna y Marte antes de lanzar.
3. **Comprender:** activar fórmulas y comparar la sustitución numérica con la gráfica.
4. **Predecir:** entrar en **Desafío**, leer semilla, distancia y desnivel sin mostrar
   la trayectoria.
5. **Lanzar y comparar:** ajustar velocidad y ángulo, observar el primer impacto y
   justificar el siguiente intento con la retroalimentación.
6. **Cerrar:** pulsar **Nuevo desafío** para transferir la estrategia a otra ciudad.

## Requisitos técnicos y fallback

- HTML, CSS y JavaScript vanilla en un único archivo (`index.html`), sin build step.
- Three.js `0.165.0` se carga desde jsDelivr mediante CDN. Se requiere conexión a
  internet para descargar el módulo al abrir la aplicación por primera vez.
- Si el dispositivo no ofrece WebGL, la vista 3D se oculta y aparece un fallback
  textual. Fuera de **Desafío**, los controles, métricas, fórmulas y gráfica siguen
  disponibles; en **Desafío** la gráfica y la guía continúan ocultas por diseño.
- La interfaz es responsiva, navegable con teclado, compatible con `prefers-reduced-motion`
  y mantiene etiquetas/estados ARIA para proyección y pantallas pequeñas.

## Cómo se despliega y se embebe en Moodle

La aplicación es estática: publique la carpeta en GitHub Pages, Netlify o Vercel y
comparta la URL. Verifique que la red institucional permita acceder al CDN de
jsDelivr. También puede embeberse en Moodle usando la siguiente **plantilla de
despliegue**. `URL_DE_DESPLIEGUE` es un token obligatorio que debe reemplazarse por
la URL real publicada; no es una URL funcional por sí misma:

```html
<!-- Reemplazar URL_DE_DESPLIEGUE por la URL real antes de pegar en Moodle. -->
<iframe src="URL_DE_DESPLIEGUE" width="100%" height="600"
        style="border:0" loading="lazy"
        title="Laboratorio 3D de Tiro Parabólico"></iframe>
```

Pruebe el enlace y el iframe en escritorio y en un ancho cercano a 320–390 px antes
de compartirlo con el grupo.
