# Proposal

## Why

Rumbo (portal de aprendizaje de 1º ESO) solo existe como prototipo de diseño en `design/handoff/`, que depende de un runtime propio y de CDNs. Necesitamos una base real: una app estática en HTML/CSS/JS puro, sin backend ni paso de build, que se despliegue sola en GitHub Pages cada vez que se integre algo en `main`. Sin esta base, los módulos y retos posteriores no tienen dónde apoyarse.

## What Changes

- Estructura del proyecto: `index.html`, CSS con los tokens del diseño (colores, tipografía, radios, sombras «3D chunky»), JS con ES modules nativos y un router por hash con rutas relativas (compatible con la subruta `/<repo>/` de Pages).
- Store de progreso en `localStorage` (clave `rumbo-ue-v1`) con fallback a memoria cuando el almacenamiento no está disponible, y opción de «borrar mi progreso».
- Portal: cabecera con logo, racha diaria y puntos; saludo; tarjeta del módulo «Países y capitales de Europa» (con acceso aún sin contenido del módulo); tarjeta «Próximamente»; rejilla de las 8 insignias con su estado ganado/no ganado.
- Todos los recursos de terceros vendorizados en `vendor/` (d3-geo, topojson-client, world-atlas, fuentes Fredoka y Nunito, banderas SVG de los 51 países). Ninguna referencia a CDNs.
- Workflow de GitHub Actions que ejecuta los tests y despliega en GitHub Pages en cada push a `main` (`upload-pages-artifact` + `deploy-pages`, sin `npm build`).
- Tests de lógica pura con `node --test` (store, racha diaria, reglas de insignias) como puerta previa al despliegue.

Fuera de alcance (cambios siguientes): pantalla del módulo Europa y mapa de dominio, motor de retos, mapa interactivo y «Empareja», resultados e insignias ganadas en juego.

## Capabilities

### New Capabilities
- `app-shell`: estructura estática, tokens de diseño, router por hash con rutas relativas y navegación entre pantallas.
- `portal`: pantalla de inicio con cabecera (racha y puntos), saludo, tarjeta de módulo, «Próximamente» e insignias.
- `progress-store`: persistencia local del progreso (puntos, racha, dominio, insignias) con fallback a memoria y borrado.
- `vendored-assets`: recursos de terceros empaquetados en el repositorio, sin dependencias externas en tiempo de ejecución.
- `pages-deployment`: pipeline de CI que prueba y despliega el sitio estático en GitHub Pages desde `main`.

### Modified Capabilities

## Impact

- Código nuevo en la raíz del repo: `index.html`, `css/`, `js/`, `vendor/`, `tests/`, `.github/workflows/`.
- Requiere activar GitHub Pages con fuente «GitHub Actions» en la configuración del repositorio (paso manual único).
- Sin dependencias de runtime ni npm; Node solo se usa en CI para `node --test`.
- `design/handoff/` queda como referencia y no se publica.
