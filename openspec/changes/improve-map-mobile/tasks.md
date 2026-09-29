# Tasks

## 1. Lógica pura de la vista y de los toques

- [x] 1.1 Crear `js/lib/map-view.js` con `BASE = { x: 20, y: 6, w: 724, h: 700 }`, los límites de ampliación (1–8), `clampView`, `zoomAt`, `panBy` y `viewBox`; verificar con `tests/map-view.test.js`: límite inferior y superior de zoom, el punto bajo los dedos no se mueve al ampliar, a 1× la vista queda centrada y con zoom el arrastre no saca la vista del contenido.
- [x] 1.2 Añadir `ensureVisible(view, bbox, pad)` (desplazamiento mínimo y, si hace falta, menos zoom); verificar con tests: cajas ya visibles no cambian la vista, una caja fuera se trae a la vista, dos cajas separadas fuerzan el zoom necesario.
- [x] 1.3 Añadir `isTap({ distance, hadSecondPointer })` y `pickCountry(...)` con las constantes `TAP_SLOP=8`, `SMALL_PX=28` y `TAP_RADIUS_PX=20`; verificar con tests: toque con 3 px cuenta, con 40 px o con segundo puntero no; microestado a 12 px se resuelve, dentro de Montenegro gana Montenegro, lejos de los pequeños gana el país bajo el dedo y con zoom (país ≥ 28 px) la tolerancia desaparece.
- [x] 1.4 Crear `js/lib/sort.js` con `sortByName` (colador `es`, sin artículo inicial) y verificar con `tests/sort.test.js`: 51 países, primero «Albania», «Bélgica» antes de «Bielorrusia» y «El Vaticano» el último.

## 2. Encuadre y anclas del mapa

- [x] 2.1 Sustituir el `viewBox` fijo de `js/ui/europe-map.js` por `BASE` y hacer que el grosor de trazo sea `base / k`; verificar en el navegador que el mapa completo se ve igual que antes pero sin márgenes vacíos, y ampliar `tests/map-geometry.test.js` para comprobar con la geometría vendorizada que los 51 países (polígonos o puntos) intersectan `BASE`.
- [x] 2.2 Calcular las anclas de cada país (centro y lado mayor del polígono de mayor área; círculo de 11 unidades para los microestados) y exponerlas para la resolución de toques; verificar en el navegador a 360 px que los tamaños en pantalla coinciden con los medidos (Luxemburgo 4 px, Kosovo 9 px).

## 3. Gestos, zoom y controles

- [x] 3.1 Implementar en `europe-map.js` la opción `zoomable`, los botones «+», «−» y «Restablecer vista» (44 px, deshabilitados en los límites, con animación y respeto de `prefers-reduced-motion`) y el `touch-action` dinámico; verificar en el navegador: los límites 1× y 8×, restablecer y que sin `zoomable` no aparecen botones.
- [x] 3.2 Implementar los gestos con Pointer Events (arrastre con `k > 1`, pellizco con dos punteros, captura al superar el umbral); verificar con eventos de puntero sintéticos: arrastre desplaza y respeta los bordes, pellizco amplía sobre el punto medio y ninguno de los dos notifica un país.
- [x] 3.3 Sustituir el `click` por la resolución de toque (`isTap` + `pickCountry` con `elementFromPoint`); verificar en el navegador con toques sintéticos: San Marino a 12 px, Montenegro dentro de su polígono, el centro de Alemania, el mapa no interactivo sin respuesta y el ratón de escritorio con el mismo resultado.

## 4. Reto Mapa y lista alfabética

- [x] 4.1 Activar `zoomable` en `js/ui/play/mapa.js`, conservar la ampliación entre preguntas y llamar a `ensureVisible` con los países marcados al responder; verificar en el navegador: con zoom sobre Iberia, tocar un país de los Balcanes y fallar deja a la vista el correcto en verde y el tocado en rojo, y un arrastre no responde.
- [x] 4.2 Ordenar la lista de `js/ui/module.js` con `sortByName`; verificar en el navegador el orden (Albania primero, Bélgica antes que Bielorrusia, El Vaticano último) y que las descripciones de nivel no cambian.

## 5. Integración

- [x] 5.1 Actualizar `README.md` (zoom y gestos del mapa, `js/lib/map-view.js`); verificar que las rutas y comandos documentados siguen siendo válidos.
- [x] 5.2 Pasar `node --test` completo y una prueba manual del reto Mapa en 360 px, tablet y escritorio (sin scroll horizontal, sin peticiones externas, sin errores de consola); comprobar que el mapa de la tarjeta del portal y el del módulo no han cambiado de comportamiento.
- [ ] 5.3 Tras el push a `main`, comprobar que el workflow termina en verde y que el reto Mapa funciona en la URL publicada.
