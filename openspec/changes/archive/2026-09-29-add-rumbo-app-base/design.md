# Design

## Context

Repositorio vacío salvo `design/handoff/` (referencia hifi: README con tokens y reglas, prototipo `Rumbo.dc.html` con runtime propio, `mapa-ue.html` con d3 en iframe). El prototipo carga d3, topojson, world-atlas, fuentes y banderas desde CDNs, y guarda el progreso en `localStorage` (`rumbo-ue-v1`). Restricciones: HTML/CSS/JS puro, despliegue en GitHub Pages desde `main`, sin base de datos. Motivación y alcance en proposal.md; requisitos en `specs/`.

Este cambio solo construye la base y el portal. Los cambios siguientes añaden módulo Europa, mapa, motor de retos y resultados, así que la estructura debe dejarles sitio (módulos declarativos, motor genérico) sin implementarlos.

## Goals / Non-Goals

**Goals:**
- Una base sin build que un cambio futuro pueda extender sin reorganizar carpetas.
- Lógica pura (store, racha, dominio, insignias) separada del DOM y cubierta con `node --test`.
- Repositorio autocontenido: ningún acceso a terceros en ejecución.

**Non-Goals:**
- Pantalla del módulo, mapa renderizado, retos, resultados y ganar insignias jugando.
- Rasterizar o pulir el mapa: solo se vendoriza el material.
- Soporte de navegadores sin ES modules.

## Decisions

**1. Estructura de carpetas**
```
index.html
css/        tokens.css  base.css  components.css  fonts.css
js/
  main.js            arranque, monta router y cabecera
  router.js          hash router
  store.js           persistencia (lógica pura, storage inyectable)
  lib/               streak.js  mastery.js  badges.js  (funciones puras)
  data/              badges.js  europa.js (lista de 51 países, iso2, niveles)
  ui/                header.js  home.js  module-stub.js  dom.js
vendor/  d3-geo  topojson-client  world-atlas  flags/  fonts/
tests/                node --test
.github/workflows/pages.yml
```
`js/data/europa.js` incluye ya los 51 países con capitales y alternativas (del README) porque las banderas, el conteo «51 países · 4 niveles» y el test de cobertura los necesitan. Motivo frente a diferirlo: evita duplicar la lista después.

**2. ES modules nativos, sin bundler.** Alternativa Vite: da HMR y minificación, pero añade `npm build` al despliegue y rompe la regla «sin build». Los módulos nativos se sirven tal cual en Pages y `node --test` importa los mismos ficheros. Trade-off: más peticiones HTTP; aceptable con HTTP/2 y este tamaño.

**3. Render con funciones DOM propias, sin framework.** Un helper `h(tag, attrs, ...children)` y cada pantalla es una función `render(state) → nodo`. Alternativas: React vendorizado (peso y JSX sin build), web components (más ceremonia). El estado es pequeño y las pantallas se re-renderizan enteras al cambiar de ruta o de progreso. Trade-off: hay que cuidar la actualización de la cabecera; se resuelve con suscripción del store (`store.subscribe`).

**4. Router por hash** con tabla `{ '/': home, '/europa': moduleStub }` y fallback al portal. El hash evita reescrituras de servidor que Pages no ofrece; rutas relativas en todo (`./css/...`) para funcionar bajo `/<repo>/`. Alternativa History API: necesita `404.html` con truco de redirección.

**5. Store con almacenamiento inyectable.** `createStore(storage)` recibe un objeto con `getItem/setItem/removeItem`; en el navegador se pasa `localStorage` envuelto en try/catch y, si falla, un `Map` en memoria. Esto permite probar corrupción, bloqueo y campos ausentes en Node sin DOM. Estado por defecto y forma según README (`points, streak, lastDay, m, badges, types`); se fusiona con lo guardado campo a campo. El día se guarda como `"YYYY-M-D"` según README; el reloj es inyectable para probar la racha.

**6. Vendorizado con script reproducible.** Un script `scripts/vendor.mjs` (solo dev, no se despliega) documenta cómo se obtuvieron los ficheros (`npm pack` de `d3-geo`, `topojson-client`, `world-atlas`, `flag-icons`, y fuentes desde `@fontsource/fredoka` y `@fontsource/nunito`), copia el subconjunto necesario y fija versiones. El resultado se **commitea**; el despliegue nunca lo ejecuta. Alternativa: dependencias npm y build; descartada por el punto 2. Se elige geometría `110m` como en el handoff; `50m` queda para un cambio posterior si se quieren costas finas.
   - d3-geo depende de d3-array: se vendoriza el bundle ESM mínimo (o d3-geo con su dependencia) para que `import` funcione sin resolución de paquetes.
   - Banderas: `flag-icons` (MIT) en SVG 4x3, renombradas a `{iso2}.svg`; Kosovo (`xk`) existe en el paquete.
   - Fuentes: `woff2`, subconjunto latino, pesos indicados, `font-display: swap` en `css/fonts.css`.
   - Cada librería conserva su `LICENSE`.

**7. Guardas automáticas contra CDNs.** Un test recorre HTML/CSS/JS de la app (excluye `vendor/`, `design/`, `openspec/`) y falla si aparece `http://` o `https://` fuera de espacios de nombres SVG/XML permitidos (`www.w3.org`). Otro comprueba que existe `vendor/flags/{iso2}.svg` para los 51 países.

**8. Workflow de Pages.** Dos jobs: `test` (`actions/checkout`, `actions/setup-node`, `node --test`) y `deploy` (needs: test; `configure-pages`, `upload-pages-artifact`, `deploy-pages`). El artefacto se compone copiando solo `index.html`, `css`, `js`, `vendor` a un directorio `_site` con `cp` (sin npm install), lo que excluye `design/`, `openspec/`, `tests/`. Disparadores: `push` a `main` y `workflow_dispatch`. `permissions`: `contents: read`, `pages: write`, `id-token: write`; `concurrency: group: pages, cancel-in-progress: false`. Alternativa: publicar la raíz entera; descartada por exponer `design/` y `openspec/`.

**9. Portal ↔ módulo aún inexistente.** La tarjeta enlaza a `#/europa`, que muestra una pantalla provisional («próximamente» + volver). Así el flujo de navegación y el cálculo de «¡Empezar!/Continuar» se prueban ya, y el cambio del módulo sustituye solo ese fichero.

**10. Insignias.** Se define ya el catálogo de 8 (`js/data/badges.js`) porque el portal las pinta; las reglas de concesión (`lib/badges.js`) se implementan como funciones puras sobre estado y resumen de sesión y se prueban, pero nada las invoca hasta el cambio de resultados. Motivo: fijar el contrato de datos y no rehacer el portal.

## Risks / Trade-offs

- [Pages sin activar: el workflow falla en `configure-pages`] → Documentar en README el paso único Settings → Pages → Source: GitHub Actions.
- [Repositorio de proyecto sirve bajo `/<repo>/` y una ruta absoluta se cuela] → Regla de rutas relativas + test que busca `src="/`, `href="/` y `url(/`.
- [d3-geo vendorizado con dependencias sin resolver en el navegador] → Verificar con una carga manual de importación en el navegador durante la tarea de vendorizado; se usa bundle ESM autocontenido.
- [Peso de fuentes y banderas] → Subconjunto latino y solo los 51 SVG; los SVG de flag-icons son ligeros (revisar tamaño total).
- [Kosovo y microestados en el mapa se resuelven más tarde] → Fuera de este cambio; solo se garantiza la bandera y los datos.
- [`localStorage` compartido por origen en `*.github.io`] → La clave lleva prefijo `rumbo-` y el estado se valida al cargar.
- [Sin build no hay minificación] → Aceptado; el tamaño total es pequeño.

## Migration Plan

1. Fusionar el cambio a `main` con la rama de Pages activada en Settings.
2. El primer push dispara el workflow; comprobar la URL publicada.
3. Rollback: revertir el commit en `main` (el siguiente despliegue restaura la versión anterior) o volver a ejecutar el workflow de un commit previo.
