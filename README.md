# Rumbo

Portal de aprendizaje para 1º de ESO. Primer módulo: **Países y capitales de Europa**.

Es un sitio estático (HTML, CSS y JavaScript con ES modules), sin build ni backend. El progreso se guarda solo en el navegador (`localStorage`, clave `rumbo-ue-v1`).

## Ejecutar en local

Cualquier servidor de ficheros estáticos sirve. Con Node:

```bash
npx --yes http-server . -p 5173 -c-1
```

y abre <http://localhost:5173/>.

## Pruebas

```bash
node --test
```

Cubren la lógica pura (store, racha, dominio, insignias, router), los datos, el vendorizado (51 banderas, librerías, fuentes) y que la app no referencie orígenes externos ni rutas absolutas.

## Estructura

```
index.html
css/       tokens, base, componentes y fuentes
js/        main, router, store; data/ (países, insignias); lib/ (lógica pura); ui/ (pantallas)
vendor/    d3-geo, topojson-client, world-atlas, banderas SVG y fuentes (todo local, sin CDNs)
tests/     node --test
design/    handoff de diseño (referencia, no se publica)
openspec/  especificaciones y cambios
```

## Recursos de terceros (`vendor/`)

Se commitean en el repositorio. Para regenerarlos con las versiones fijadas en `scripts/vendor.mjs`:

```bash
node scripts/vendor.mjs
```

## Despliegue

Cada push a `main` ejecuta `.github/workflows/pages.yml`: pasa las pruebas y publica `index.html`, `css/`, `js/` y `vendor/` en GitHub Pages.

Configuración única: en el repositorio, **Settings → Pages → Build and deployment → Source: GitHub Actions**. GitHub Pages es gratis para repositorios públicos.

Todas las rutas son relativas y la navegación usa `#/ruta`, así que funciona bajo `https://<usuario>.github.io/<repo>/`.
