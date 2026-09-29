# Tasks

## 1. Datos y lógica pura

- [x] 1.1 Crear `js/data/europa.js` con los 51 países (iso2, nombre, capital, alternativas, nivel) y `js/data/badges.js` con las 8 insignias; verificar con `tests/data.test.js` (51 países, 4 niveles con 13/14/15/9 países, iso2 únicos, 8 insignias).
- [x] 1.2 Implementar `js/lib/streak.js` (actualización de racha y racha mostrada, con reloj inyectable) y verificar con tests de los escenarios: ayer, hoy, racha rota y caducada.
- [x] 1.3 Implementar `js/lib/mastery.js` (dominio medio Σ/(n×5), acotado 0–5) y verificar con el test de 4 países 5,5,0,0 = 50%.
- [x] 1.4 Implementar `js/lib/badges.js` (reglas de concesión como funciones puras) y verificar con tests por insignia; no se invoca aún desde la UI.
- [x] 1.5 Implementar `js/store.js` (`createStore(storage)`, defaults, fusión campo a campo, `subscribe`, `reset`) y verificar con tests: primera visita, recuperar progreso, JSON corrupto, campos ausentes, almacenamiento que lanza errores (fallback a memoria) y borrado.

## 2. Vendorizado de recursos

- [x] 2.1 Escribir `scripts/vendor.mjs` (solo dev, versiones fijadas) y vendorizar `d3-geo` (ESM autocontenido), `topojson-client` y `world-atlas` 110m en `vendor/` con sus `LICENSE`; verificar con `tests/vendor.test.js` que los ficheros y licencias existen.
- [x] 2.2 Vendorizar las banderas SVG de los 51 países como `vendor/flags/{iso2}.svg` (incluido `xk`) y verificar con un test que cubre todos los iso2 de `europa.js`.
- [x] 2.3 Vendorizar Fredoka (500/600/700) y Nunito (500–800) en woff2 latino con `css/fonts.css` y `font-display: swap`; verificar abriendo la app sin red externa y que los títulos usan Fredoka.
- [x] 2.4 Añadir `tests/no-external.test.js` que falla ante `http(s)://` externos y rutas absolutas (`src="/`, `href="/`, `url(/`) en HTML/CSS/JS de la app; verificar que pasa y que falla al introducir una URL de CDN de prueba.

## 3. Estructura, estilos y router

- [x] 3.1 Crear `index.html` (viewport, rutas relativas, `<script type="module" src="./js/main.js">`) y `css/tokens.css` con la paleta, radios, sombras y escala del README; verificar que la página carga sin errores de consola.
- [x] 3.2 Escribir `css/base.css` y `css/components.css` (botón chunky con `:active`, chips, tarjeta, contenedor 1120px, objetivos ≥44px); verificar visualmente el botón pulsado y sin scroll horizontal a 360px.
- [x] 3.3 Implementar `js/router.js` (tabla de rutas, fallback al portal, scroll arriba al cambiar) y `js/ui/dom.js` (helper `h`); verificar con un test del resolutor de rutas (ruta válida, desconocida) y manualmente recarga y botón atrás.

## 4. Portal

- [x] 4.1 Implementar la cabecera `js/ui/header.js` (logo que lleva al portal, chip 1º ESO, racha con singular/plural, puntos) suscrita al store; verificar con progreso inicial y con racha 1.
- [x] 4.2 Implementar `js/ui/home.js`: saludo, tarjeta del módulo (etiquetas, barra «Tu dominio», «¡Empezar!/Continuar») y tarjeta «Próximamente»; verificar con dominio 0 y >0 usando progreso de prueba en `localStorage`.
- [x] 4.3 Añadir la rejilla de insignias con contador «{n} de 8» y estado atenuado; verificar con 0 y con «Primera misión» ganada.
- [x] 4.4 Añadir «Borrar mi progreso» con confirmación y `js/ui/module-stub.js` («próximamente» con enlace de vuelta); verificar confirmar, cancelar y navegación de la tarjeta a `#/europa`.
- [x] 4.5 Ensamblar `js/main.js` con store real (localStorage envuelto con fallback a memoria) y comprobar en navegador con `localStorage` bloqueado que el portal funciona.

## 5. Despliegue

- [x] 5.1 Crear `.github/workflows/pages.yml` con jobs `test` (`node --test`) y `deploy` (needs test; solo `index.html`, `css`, `js`, `vendor` a `_site`; permisos mínimos; `concurrency` sin cancelar; disparadores `push` a `main` y `workflow_dispatch`); verificar con `actionlint` o revisión de sintaxis y comprobando que el artefacto excluye `design/`, `openspec/` y `tests/`.
- [x] 5.2 Documentar en `README.md` cómo ejecutar en local (`python -m http.server` o equivalente), correr las pruebas, regenerar `vendor/` y activar Pages (Settings → Pages → Source: GitHub Actions); verificar que los comandos documentados funcionan tal cual.

## 6. Integración

- [x] 6.1 Servir el repo bajo una subruta (`/aprender1eso/`) y comprobar que no hay 404 de recursos, que el hash router funciona tras recargar y que no hay peticiones a otros orígenes (pestaña Red).
- [ ] 6.2 Tras el primer push a `main` con Pages activado, comprobar que el workflow termina en verde y que la URL publicada muestra el portal.
