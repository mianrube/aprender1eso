# Design

## Context

La base (cambio `add-rumbo-app-base`) ya está desplegada: ES modules sin build, `js/store.js` con `set/get/subscribe/reset`, `js/lib/{streak,mastery,badges}.js` (racha, dominio, insignias y desbloqueo), datos en `js/data/europa.js` (51 países, 4 niveles) y `js/data/badges.js`, router por hash (`#/`, `#/europa`), render con el helper `h()`, y `vendor/` con d3-geo, topojson-client, world-atlas 110m, 51 banderas SVG (4:3) y fuentes. La pantalla `#/europa` es un stub.

La referencia funcional es `design/handoff/Rumbo.dc.html` (lógica de sesión) y `mapa-ue.html` (mapa). Motivación y alcance en proposal.md; requisitos en `specs/`.

## Goals / Non-Goals

**Goals:**
- Que el motor sea **lógica pura y testeable** (sin DOM) y la UI una capa fina encima, para poder añadir módulos nuevos reutilizando el motor.
- Reproducir el comportamiento del prototipo, incluido guardar dominio y puntos en cada respuesta.
- Un solo componente de mapa para portal, módulo y reto Mapa.

**Non-Goals:**
- Un framework de módulos genérico completo: el motor se escribe sobre pares pregunta–respuesta, pero solo se usa con Europa.
- Ajustes de usuario para los parámetros (son constantes en `js/config.js`).
- Accesibilidad completa del mapa con teclado, y geometría 50m.

## Decisions

**1. Motor puro con sesión inmutable.** `js/engine/` contiene funciones sin DOM ni `Math.random` directo (el generador se inyecta con `rng = Math.random`):
```
engine/
  rng.js        shuffle, pickOne, pickWeighted
  normalize.js  norm(), levenshtein(), checkWritten()
  select.js     selectCountries(pool, mastery, n, rng)
  questions.js  makeQuestion(type, country, all, rng), capitalHasCountryName()
  session.js    createSession(), answer(), cardAnswer(), matchTap(), next(), summary()
  scoring.js    points(), applyAnswer(save, id, ok) -> save parcial
  levels.js     levelPct(), isUnlocked()
```
`session.js` expone reductores: `answer(session, save, {ok, given, detail}) → { session, save }`, donde `save` se devuelve con dominio y puntos actualizados. La UI llama al reductor, escribe `save` con `store.set()` y re-renderiza. Alternativa: una clase con estado mutable como el prototipo; se descarta porque es difícil de probar y mezcla persistencia con reglas.

**2. Persistir en cada respuesta, cerrar al terminar.** `answer` actualiza `m` y `points` y la UI los guarda de inmediato, como el prototipo; `finish()` (en `session.js`, puro) devuelve además `racha, lastDay, types, badges`. Así ✕ conserva lo ganado sin marcar la sesión como terminada. Las insignias y la racha usan `lib/streak.nextStreak` y `lib/badges.newBadges` ya existentes; se les pasa `{ misses, best }`.

**3. Estado de UI en memoria, aparte del store.** `js/ui/state.js` guarda `{ level, session }` en un módulo con `subscribe`, no en `localStorage`. La sesión sobrevive a la navegación entre `#/europa/reto` y `#/europa/resultados`; si una ruta de juego se abre sin sesión, el router redirige a `#/europa`. El nivel seleccionado persiste mientras dure la pestaña (spec «Estado recordado»).

**4. Rutas y cabecera.** Se amplía la tabla de rutas a `/europa/reto` y `/europa/resultados`. Cada ruta declara si lleva cabecera (`chrome: true/false`); `main.js` la pinta solo en portal y módulo. Un guard de ruta por pantalla (`enter(state) → path|null`) resuelve la redirección sin sesión. El re-render sigue siendo por pantalla completa; para el reto, que cambia con cada tecla, se diseña para **no** re-renderizar todo al escribir en el campo (ver decisión 7).

**5. EuropeMap como componente con API imperativa.** `createEuropeMap(container, opts)` devuelve `{ update({fills, names, marks, interactive, showNames}), destroy() }`. Carga `world-atlas` con `fetch` de la ruta relativa y cachea el `Promise` del topojson a nivel de módulo (los mapas de portal, módulo y reto lo comparten). Dibuja una sola vez y `update` solo cambia atributos (`fill`, `stroke-width`, clase), así el reto Mapa no recrea el SVG en cada pregunta. Proyección y viewBox 800×760 según el README (`geoAzimuthalEqualArea`, `rotate([-20,-54])`, `clipAngle(70)`, `fitExtent`). Mapeo país↔iso2: tabla `NUM` del prototipo (iso numérico → iso2), `BYNAME` para Kosovo, Noruega, Francia, N. Cyprus, Macedonia, etc., y `DOTS` para los microestados como `circle r=5.5`, más `FALLBACK` (puntos para países que falten en 110m). Se importan solo `geoAzimuthalEqualArea` y `geoPath` del bundle de d3-geo vendorizado, y `feature` de topojson-client.
   - Un test comprueba que los 51 iso2 se resuelven a un polígono o a un punto con la geometría vendorizada, para detectar huecos de Kosovo, Chipre norte o microestados sin abrir el navegador.
   - Para el portal y el módulo la interacción se desactiva con `interactive:false` y el contenedor lleva `pointer-events:none` en la tarjeta del portal.

**6. Regla «capital contiene el país» sin depender del prefijo.** El prototipo compara `norm(capital).includes(norm(país).slice(0,5))`, que con «El Vaticano» (`elvat`) ya no detecta «Ciudad del Vaticano». Se implementa `capitalHasCountryName(c)` quitando artículos iniciales («el», «la», «los», «las») del nombre antes de normalizar y comprobando que la capital incluye ese nombre completo o, si es más largo de 5 letras, sus primeras 5 (cubre Andorra, Luxemburgo, Mónaco, San Marino, Vaticano). Se prueba con los 51 países: solo esos 5 dan verdadero. Para el reto Mapa modo capital se mantiene la regla del README (solo Test), aceptando que «Toca el país cuya capital es Mónaco» sea trivial.

**7. UI del reto: pintar la pregunta, no el árbol entero.** Cada tipo de reto es un módulo `ui/play/{test,banderas,escribir,tarjetas,mapa,emparejar}.js` que exporta `render(ctx)` y opcionalmente `mount/unmount`. La pantalla `play.js` monta la barra superior, el cuerpo del reto y el panel de feedback; al cambiar de pregunta reconstruye solo el cuerpo. El input de Escribe no se reconstruye al teclear (su valor se lee al comprobar), lo que evita perder foco. Test y Banderas comparten un renderizador de opciones. Alternativa: un único render global como en la base; se descarta por el foco del input, la animación de giro de las tarjetas y los temporizadores de Empareja.

**8. Atajos y temporizadores con limpieza.** Un único listener de `keydown` (Intro) se registra al entrar en `#/europa/reto` y se retira al salir. Los `setTimeout` (650 ms de error en Empareja, 600 ms al completar) se guardan en el estado de la pantalla y se cancelan en `unmount` y al pulsar ✕, para evitar navegar tras abandonar.

**9. Empareja como submáquina propia.** `matchTap(match, side, id)` devuelve `{match, event}` con eventos `select`, `ok`, `wrong`. `wrong` deja `wrong:{l,r}` y la UI lo limpia a los 650 ms. Cada pareja acertada llama a `applyAnswer` con `ok = !errs[id]`; el resultado registra `{id, ok, given:null}`. Es la misma semántica del prototipo.

**10. Banderas y tamaños.** Las banderas locales son SVG 4:3; el diseño pide 3:2 para la grande y 38×26 para las de lista. Se muestran con `object-fit: cover` dentro de la caja del diseño, recortando ligeramente los lados; el recorte es aceptable para el reconocimiento y se revisa visualmente en la tarea de Banderas.

**11. Configuración.** `js/config.js` exporta `QUESTIONS_PER_ROUND = 8`, `UNLOCK_THRESHOLD = 0.6`, `SHOW_CAPITALS = true`, y `lib/badges.js` ya acepta el umbral. Sustituye los «tweaks» del prototipo.

**12. Tests con `node --test`.** Motor, normalización, selección ponderada (con `rng` determinista), reglas de pregunta, puntuación, dominio, `matchTap`, `finish` y desbloqueo. El mapa y las pantallas se verifican en el navegador (pila de tareas por reto) porque dependen del DOM.

**13. «Todos los países» como nivel 0.** Se añade una quinta opción con `level = 0` (constante `LEVEL_ALL` en `engine/levels.js`) que usa los 51 países. `countriesOfLevel(0)` devuelve todos, `isUnlocked(0)` es siempre verdadero y `levelPct(0)` es el dominio total. No se hacen niveles acumulativos (el 3 = 1+2+3) porque mezclarían el contenido con el desbloqueo y los porcentajes; el nivel 0 reutiliza el motor sin tocar las reglas de desbloqueo ni las insignias de nivel.

## Risks / Trade-offs

- [Geometría 110m no trae Kosovo, algunos Balcanes ni microestados con id propio] → `BYNAME`, `DOTS`, `FALLBACK` y un test que cubre los 51; revisión visual del mapa.
- [Los microestados como círculos de r=5.5 son difíciles de tocar en móvil] → aceptado por diseño; se aumenta el área tocable con un círculo transparente mayor si la prueba en 360px lo requiere.
- [Recortar banderas 4:3 a 3:2 corta detalles (p. ej. Suiza cuadrada, Vaticano cuadrada)] → `object-fit: cover` con revisión visual; si un país queda mal, se usa `contain` solo para él.
- [Fuga de listeners y temporizadores al salir de un reto] → `unmount` obligatorio en cada pantalla y prueba manual de ✕ durante Empareja.
- [Reglas duplicadas entre `lib/` y `engine/`] → el motor importa `lib/mastery`, `lib/streak` y `lib/badges` en lugar de reimplementarlos.
- [El mapa se carga en cada pantalla la primera vez] → el `fetch` se cachea y el JSON pesa ~100 KB.
- [Cambio grande en un solo PR] → tareas agrupadas en bloques verificables por separado (motor, mapa, módulo, cada reto, resultados) y despliegue posible tras cada bloque.

## Migration Plan

1. Implementar por bloques sobre `main`; cada push despliega, así que el stub `#/europa` se mantiene hasta que el módulo esté listo (el bloque del módulo lo sustituye).
2. El formato de guardado (`rumbo-ue-v1`) no cambia; los usuarios con progreso lo conservan.
3. Rollback: revertir el commit; el progreso guardado sigue siendo compatible.

## Open Questions

- Si algún país queda ilegible con el recorte de bandera 3:2, decidir por país si se usa `contain`. Se resuelve mirando las banderas al implementar el reto Banderas, sin afectar a los specs.
