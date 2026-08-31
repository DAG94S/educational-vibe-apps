# Plan — Laboratorio 3D de Tiro Parabólico

**Área:** Física (Ciencias Básicas)  
**Referente:** PhET — https://phet.colorado.edu (sim “Projectile Motion”)  
**Estado:** ✅ v4 implementado y verificado — desafío urbano 3D listo para aula

---

## Concepto a enseñar

El movimiento de un proyectil como composición de dos movimientos independientes:
MRU horizontal + MRUV vertical (gravedad). Cómo el ángulo, la velocidad inicial y la
gravedad determinan alcance, altura máxima y tiempo de vuelo. El desafío urbano añade
la lectura física de una trayectoria entre superficies con alturas diferentes.

## Objetivo pedagógico

Que el estudiante construya la intuición de que la trayectoria parabólica no es
“magia”, sino la suma de dos movimientos simples, **antes** de ver las fórmulas; luego
debe usar esa intuición para justificar ajustes después de cada impacto.

## Qué controla el usuario (inputs)

- Slider de **velocidad inicial** (`v₀`).
- Slider de **ángulo de lanzamiento** (`θ`).
- Slider de **gravedad** (`g`) y presets Tierra / Luna / Marte.
- Botones **Lanzar**, **Reiniciar** y, en Desafío, **Nuevo desafío**.
- Toggles de vectores y fórmulas (ocultos junto con la guía durante Desafío).

## Qué observa (outputs en vivo)

- Escena 3D con cañón, terreno, edificios, azoteas y objetivo.
- Trayectoria prevista y vectores en Explorar/Comprender; gráfica SVG sincronizada.
- Lecturas dinámicas: alcance, altura máxima, tiempo de vuelo y componentes de
  velocidad.
- En Desafío: semilla corta, intentos, distancia, desnivel y retroalimentación del
  primer impacto.

## Stack y técnica

- HTML/CSS/JS vanilla en un solo `index.html`.
- Three.js `0.165.0` por CDN jsDelivr (sin npm, bundler ni backend).
- Motor físico y colisiones continuas implementados como funciones puras dentro del
  módulo; el render 3D consume sus resultados.
- Fallback textual cuando WebGL no está disponible; fuera de **Desafío**, métricas,
  fórmulas y gráfica no dependen de la vista 3D. En **Desafío**, la gráfica y la guía
  permanecen ocultas por diseño.

## Qué le robamos al referente

- Manipular primero, fórmula después.
- Un solo concepto, foco total y retroalimentación inmediata.
- Presets de planetas para comparar `g`.
- Secuencia docente: explicar → explorar → predecir → lanzar → comparar.

## Checklist de entrega

- [x] `index.html` 3D autocontenido con Three.js fijado por CDN.
- [x] Instrucción de uso visible dentro de la app.
- [x] README con desafío urbano, uso en clase, despliegue y snippet de Moodle.
- [x] Escenarios sembrados persistentes (3–7 edificios, alturas variables, cañones y
      objetivos en suelo/azotea).
- [x] Guía, trayectoria, vectores y gráfica ocultos únicamente en Desafío.
- [x] Colisiones continuas fachada/techo/objetivo/suelo y primer impacto determinista.
- [x] Accesibilidad: teclado, etiquetas ARIA, `aria-live`, contraste y reducción de
      movimiento.
- [x] Verificación estática, Puppeteer, almacenamiento sin persistencia y secuencia
      AulaLab; capturas desktop/mobile actualizadas.

## Historial de iteraciones

### v1 — primera versión 2D

- Maqueta, lógica y animación con Canvas; física separada del render.

### v2 — corrección de bug y mejora gráfica 2D

- **Bug corregido:** los cambios de gravedad no se veían porque el autoescalado
  conservaba la forma aparente de la parábola.
- **Solución:** escala fija referenciada a `g = 1.6` (Luna), conservando la intuición
  visual de que menor gravedad produce una trayectoria más amplia.
- **Mejoras:** grilla en metros, ejes rotulados, cañón que rota con el ángulo,
  trayectoria predicha, altura máxima, punto de caída y vectores.

### v3 — migración a laboratorio 3D

- Escena Three.js, cámara orbital, controles responsivos, gráfica SVG accesible y
  modos Explorar / Comprender / Desafío.
- Se mantuvo el motor físico ideal y la separación entre cálculo, estado y render.

### v4 — desafío urbano aleatorio (actual)

- Generador sembrado con solución oculta, validación y reintentos acotados.
- Persistencia de semilla y contador de intentos hasta **Nuevo desafío**.
- Ciudad de 3–7 edificios con alturas variables; lanzamiento y objetivo en suelo o
  azoteas.
- Colisiones continuas mediante segmentos contra AABB ampliadas por el radio del
  proyectil; se detiene en fachada, techo, objetivo o suelo según el primer `t`.
- Cámara encuadrada al crear/reingresar al desafío sin seguir el proyectil ni revelar
  la solución; la guía se restaura al salir.
- Mensajes neutrales para objetivo, fachada, techo, tiro corto/largo y error de altura.
- Fallback honesto sin WebGL, navegación por teclado y estados ARIA conservados.

## Trade-offs y límites conocidos

- La escala visual histórica toma la Luna como referencia; valores de `g` inferiores
  pueden salir del encuadre de Explorar, una decisión consciente para hacer visible el
  efecto de la gravedad.
- Three.js se descarga desde CDN: una red sin acceso a jsDelivr no carga la escena 3D;
  el fallback cubre la ausencia de WebGL, no la desconexión de red.
- Las colisiones son continuas en el plano físico x/y y no modelan resistencia del
  aire, viento ni deformación de edificios.
