# Design

## Context

`js/ui/europe-map.js` dibuja el SVG una vez (viewBox fijo 800×760, proyección azimutal con `fitExtent([[14,14],[786,746]])`) y `update()` solo cambia colores y marcas; los clics llegan por el evento `click` de cada forma. El reto Mapa (`js/ui/play/mapa.js`) crea un mapa interactivo por sesión. Medido a 360 px: escala 0,393, microestados de 4 px, 39 de 51 países bajo 44 px. Ver proposal.md; requisitos en `specs/`.

Medición del encuadre (`path.bounds` de los polígonos de la lista): contenido útil aproximado x 31–740 (Portugal a Azerbaiyán) e y 8–706 (Nordkapp a Chipre); Rusia llega a x=1112 y Kazajistán a x=983, es decir, ya se cortan hoy. Un encuadre 724×700 frente a 800×760 solo gana ~10 % de escala en móvil, por lo que el zoom y las zonas táctiles son lo importante.

## Goals / Non-Goals

**Goals:**
- Poder acertar cualquier país con un dedo en un móvil de 360 px, con zoom y con tolerancia táctil.
- Que arrastrar o pellizcar nunca cuente como respuesta.
- Lógica de vista y de toques como funciones puras probables con `node --test`.

**Non-Goals:**
- Zoom con la rueda del ratón, teclado sobre el mapa y zoom en el mapa del módulo o del portal.
- Cambiar la geometría (110m → 50m) o el estilo visual del mapa.
- Verificar gestos en un dispositivo táctil real dentro de esta tarea: se prueban con eventos de puntero sintéticos y emulación; queda como riesgo.

## Decisions

**1. Vista = `{ k, cx, cy }` en unidades del mapa, y se aplica con el `viewBox`.** Cambiar el `viewBox` (en lugar de un `transform` sobre un grupo) mantiene el SVG sin capas extra y hace que `getScreenCTM()` convierta pantalla ↔ mapa sin cálculos propios. `js/lib/map-view.js` (puro) ofrece: `BASE` (rectángulo de contenido), `clampView`, `zoomAt(view, factor, px, py)` (mantiene fijo el punto bajo los dedos), `panBy`, `viewBox(view)` y `ensureVisible(view, bbox, pad)` (mínimo desplazamiento y, si hace falta, menos zoom). Límites: `k ∈ [1, 8]`; a `k = 1` la vista se centra en `BASE`, con zoom el centro se acota para que la ventana visible no salga de `BASE`.

**2. Encuadre base `BASE = { x: 20, y: 6, w: 724, h: 700 }`.** Se deriva de las medidas anteriores con un pequeño margen. Se sustituye el `viewBox` fijo y se conserva la proyección para no rehacer coordenadas. Un test comprueba con la geometría vendorizada que los 51 países (polígonos o puntos) intersectan `BASE`.

**3. Trazos que no crecen con el zoom.** Con `viewBox` el trazo escala. El grosor de línea se define como `base / k` (0,9 y 2,2 unidades a 1×) en `paint()` para mantener el aspecto a cualquier ampliación.

**4. Gestos con Pointer Events, no con eventos de ratón y táctiles por separado.** Un `Map` de punteros activos: un puntero → posible toque o arrastre; dos → pellizco. El toque se decide en `pointerup` con `isTap({ distance, hadSecondPointer })` (movimiento < 8 px y ningún segundo puntero). Arrastre con un puntero solo si `k > 1` y se supera el umbral; pellizco: relación de distancias entre punteros aplicada con `zoomAt` sobre el punto medio, más el desplazamiento del punto medio. `setPointerCapture` se activa al superar el umbral, para no perder el gesto fuera del SVG. Alternativa descartada: usar `click` y filtrarlo después; no distingue bien un arrastre que termina sobre un país en táctil.

**5. `touch-action` dinámico.** En un mapa interactivo con zoom, `touch-action: pan-y` a `k = 1` (el dedo puede desplazar la página; el pellizco llega al mapa) y `touch-action: none` con `k > 1` (todo gesto es del mapa). En mapas sin zoom no se toca. Riesgo: en algunos navegadores el pellizco iniciado a 1× puede desplazar la página; se mitiga con los botones «+/−».

**6. Resolución del toque por capas (`pickCountry`).** Medido a 360 px: 22 países y los 7 microestados miden menos de 28 px, y los microestados están muy juntos (San Marino–Vaticano 13,6 px, Luxemburgo–Liechtenstein 23 px). Una regla única de «el país pequeño bajo el dedo gana» hace que Bélgica o Países Bajos se coman los toques a Luxemburgo, y medir hasta el centro de la caja falla con países alargados como Croacia. Por eso: (1) un microestado a menos de `DOT_CLOSE_PX=10` gana siempre; (2) si no, el país pequeño bajo el dedo; (3) si no, el pequeño más cercano a menos de `TAP_RADIUS_PX=20`, con los microestados por la distancia a su centro y el resto por muestras de `elementFromPoint` en anillos de 5/10/15/20 px alrededor del dedo (8 direcciones); (4) si no, el país bajo el dedo. El tamaño en pantalla es `size × scale × k`, así que con zoom los países dejan de ser pequeños y la tolerancia desaparece sola. Los tamaños salen de `path.bounds` de cada país y los microestados son círculos de 11 unidades; las cajas se guardan también para traer las marcas a la vista.

**7. Botones de zoom dentro del contenedor del mapa.** Tres botones de 44 px (`+`, `−`, restablecer) en la esquina, con `aria-label`; se deshabilitan en los límites. Cambian la vista con una animación corta por `requestAnimationFrame` (~200 ms; sin animación si `prefers-reduced-motion`). Los gestos actualizan la vista directamente, sin animar. Se activan con la opción `zoomable: true`; por defecto es `false`, así que portal y módulo no cambian.

**8. Traer las marcas a la vista.** En `update()`, cuando cambian las marcas y el mapa es `zoomable`, se calcula la caja envolvente de los países marcados (a partir de las mismas anclas/cajas) y se llama a `ensureVisible`, animando. El zoom se conserva entre preguntas (el mapa del reto se crea una vez por sesión) y no se reinicia al cambiar de pregunta.

**9. Orden alfabético.** `js/lib/sort.js` exporta `sortByName(countries)` con `Intl.Collator('es', { sensitivity: 'base' })` sobre el nombre sin artículo inicial (`^(el|la|los|las)\s+`), así «El Vaticano» va a la V y las tildes no alteran el orden. La lista de `module.js` usa `sortByName(COUNTRIES)`; las descripciones de nivel siguen en el orden de los datos. Test con los 51 países: primero «Albania», «Bélgica» antes de «Bielorrusia», «El Vaticano» último.

## Risks / Trade-offs

- [No se prueban dedos reales] → eventos de puntero sintéticos (`pointerType: 'touch'`) y emulación móvil en el navegador; avisar al usuario de que un móvil real puede revelar ajustes de umbrales.
- [La tolerancia puede quitar un toque válido a un país grande junto a uno pequeño (p. ej. Francia cerca de Andorra)] → radio de 20 px que desaparece con zoom, y prioridad al país pequeño solo cuando el toque no cae dentro de otro pequeño; el zoom resuelve los casos límite.
- [Pellizco desde 1× puede desplazar la página en algunos navegadores] → `touch-action: pan-y` a 1× y botones «+/−» como alternativa.
- [Cambiar el `viewBox` en cada movimiento puede ir lento en móviles antiguos] → solo se reasigna un atributo y la geometría es de 110m; se comprueba con un arrastre continuo.
- [El encuadre nuevo recorta más de Rusia y Kazajistán] → ya estaban cortados; siguen visibles y tocables.
- [Orden alfabético distinto del de la libreta] → la libreta mezcla orden alfabético y de clase; el orden alfabético estricto es más fácil de buscar.

## Migration Plan

Sin cambios de datos ni de guardado. Cada push a `main` despliega el resultado; para deshacerlo basta revertir el commit.
