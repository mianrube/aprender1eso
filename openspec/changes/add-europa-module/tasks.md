# Tasks

## 1. Motor de retos (lógica pura)

- [x] 1.1 Crear `js/config.js` (8 preguntas, umbral 0.6, mostrar capitales) y `js/engine/rng.js` (`shuffle`, `pickOne`, `pickWeighted` con `rng` inyectable); verificar con `tests/rng.test.js` (determinismo con rng fijo, no repite elementos).
- [x] 1.2 Implementar `js/engine/normalize.js` (`norm`, `levenshtein`, `checkWritten` con exacto / casi / fallo y umbral de longitud > 3); verificar con tests de tildes, mayúsculas, espacios, formas alternativas (Kyiv), un error en palabra larga y exigencia de exactitud en palabras cortas.
- [x] 1.3 Implementar `js/engine/levels.js` (`levelPct`, `isUnlocked` reutilizando `lib/mastery`) y `js/engine/select.js` (`selectCountries` con peso `rng*(6-dominio)`, sin repetir, con tope al tamaño del pool); verificar con tests: 59% bloquea y 60% desbloquea, nivel de 9 países da 8 preguntas, frecuencia mayor para dominio 0 con muchas iteraciones.
- [x] 1.4 Implementar `js/engine/questions.js` (`makeQuestion` por tipo, 4 opciones distintas con 3 distractores de los 51, `capitalHasCountryName` sin depender del prefijo del nombre); verificar con tests: solo Andorra, Luxemburgo, Mónaco, San Marino y El Vaticano dan verdadero, 60/40 de modos con rng controlado, 70/30 en Mapa y una respuesta correcta única.
- [x] 1.5 Implementar `js/engine/scoring.js` (`points`, `applyAnswer` con dominio ±1 acotado y bonus +5 con racha ≥ 3, 5 puntos en Tarjetas); verificar con tests de acierto normal, bonus en el tercer acierto, fallo que reinicia racha y mantiene mejor racha, y límites 0 y 5.
- [x] 1.6 Implementar `js/engine/session.js` (`createSession`, `answer`, `cardAnswer`, `next`, `finish` con racha diaria, tipos y insignias vía `lib/*`, `summary`, repaso de fallos y `matchTap`); verificar con tests: Empareja (pareja correcta, error 650 ms como evento, acierto tras fallo cuenta error, orden libre, completar 6), repaso con 3 países, abandono sin cerrar, finish con «Primera misión», «Pleno», «Imparable» y sin duplicados.

## 2. Componente de mapa

- [x] 2.1 Crear `js/ui/europe-map.js` con `createEuropeMap(container, opts)` → `{ update, destroy }`: carga cacheada de world-atlas, proyección del README, tabla iso numérico → iso2, `BYNAME`, `DOTS` (microestados como círculos r=5.5) y `FALLBACK`, estados «Cargando mapa…» y de error; verificar en el navegador que se ve Europa completa sin errores de consola.
- [x] 2.2 Añadir `tests/map-geometry.test.js` que carga la geometría vendorizada y comprueba que los 51 iso2 se resuelven a un polígono o a un punto (Kosovo, Chipre, Macedonia, microestados); verificar que pasa y que falla si se quita un país de la tabla.
- [x] 2.3 Implementar rellenos por dominio (escala de 6 colores con transición), marcas ok/bad por encima, tooltip sin salirse de la ventana e interactividad opcional (clic solo si `interactive`); verificar en el navegador: color con dominio 0 y 5, tooltip «España · Madrid», mapa no interactivo ignora clics y toque en Andorra devuelve `ad`.

## 3. Pantalla del módulo y portal

- [x] 3.1 Crear `js/ui/state.js` (nivel seleccionado y sesión en memoria, con `subscribe`) y ampliar el router con `chrome` por ruta y guards de redirección; verificar con test del guard (`/europa/reto` sin sesión → `/europa`) y comprobando que no hay cabecera general en reto y resultados.
- [x] 3.2 Implementar `js/ui/module.js` con cabecera del módulo, «Dominio total», mapa con leyenda y tooltip «País · Capital»; verificar en el navegador con progreso sembrado en `localStorage`.
- [x] 3.3 Añadir los 4 niveles (porcentaje, lista de países, barra, seleccionado / bloqueado con texto y no seleccionable) y las 6 tarjetas de reto «2. Elige un reto · Nivel N»; verificar en el navegador con dominio 59% y 60% en el nivel 1 y que el nivel elegido se conserva al volver.
- [x] 3.4 Añadir la lista «Tu dominio país a país» (bandera, nombre, capital / «???», 5 segmentos con colores por dominio); verificar con dominios 2, 3 y 5 y con `SHOW_CAPITALS=false`.
- [x] 3.5 Sustituir `module-stub.js` por el módulo real, añadir el mapa de dominio sin interacción a la tarjeta del portal (`home.js`) y actualizar `tests/no-external.test.js` si hace falta; verificar en portal y módulo a 360px sin scroll horizontal.

- [x] 3.6 Añadir la opción «Todos los países» (nivel 0: `countriesOfLevel`, `isUnlocked`, `levelPct`, tarjeta en el módulo y chip en el reto y los resultados); verificar con tests de nivel 0 y jugando un Test en el navegador que mezcla niveles y que «Elegir otro reto» la conserva.

## 4. Estructura de la sesión de reto

- [x] 4.1 Implementar `js/ui/play.js` (barra superior con ✕, progreso, chips de racha / puntos / tipo / nivel o repaso, cuerpo del reto, panel de feedback fijo con `safe-area`) y el listener único de Intro con `unmount`; verificar que ✕ vuelve al módulo conservando dominio y puntos, y que recargar en `#/europa/reto` redirige al módulo.
- [x] 4.2 Conectar el inicio de sesión desde las tarjetas del módulo (`createSession` + `store.set` por respuesta) y las rutas `#/europa/reto` y `#/europa/resultados`; verificar con una sesión de prueba que puntos y dominio se guardan en cada respuesta.

## 5. Tipos de reto

- [x] 5.1 Implementar `ui/play/options.js` (A–D, estados correcto / erróneo / atenuado) y el reto Test con los dos modos de pregunta y sus detalles de fallo; verificar en el navegador un acierto, un fallo, la pregunta de Mónaco y el atajo Intro.
- [x] 5.2 Implementar el reto Banderas con bandera grande 3:2 (`object-fit: cover`); verificar visualmente las 51 banderas y anotar las que necesiten `contain` (Suiza, Vaticano).
- [x] 5.3 Implementar el reto Escribe (foco automático, sin re-render al teclear, «Comprobar» deshabilitado si está vacío, detalles de fallo y «¡Por muy poco!»); verificar en el navegador con «paris», «Kyiv», «Estocolma» y «Lyon».
- [x] 5.4 Implementar el reto Tarjetas (giro `rotateY`, botones «Aún no me la sé» / «¡Me la sabía!», sin panel de feedback y 5 puntos); verificar en el navegador puntos y dominio tras ambas opciones.
- [x] 5.5 Implementar el reto Mapa con `EuropeMap` interactivo (modos 70/30, marcas verde / roja, nombres tras responder, ignorar países fuera de la lista y toques tras responder); verificar en el navegador acierto, fallo y toque en un país no incluido.
- [x] 5.6 Implementar el reto Empareja (6 + 6 desordenados, selección en cualquier orden, verde atenuado, parpadeo rojo 650 ms, paso a resultados a los 600 ms) con limpieza de temporizadores; verificar en el navegador un error, un acierto tras error y pulsar ✕ durante el parpadeo.

## 6. Resultados

- [x] 6.1 Implementar `ui/results.js` (chip, titular por porcentaje, «Has acertado X de Y», tres tarjetas, panel «¡Insignia nueva!», lista «Para repasar» sin duplicados) ancho 680 sin cabecera; verificar con sesiones de 8/8, 5/8 y 3/8 y con un país fallado dos veces.
- [x] 6.2 Implementar «Repasar fallos», «Otra vez» y «Elegir otro reto» (mantiene el nivel); verificar en el navegador el repaso con 3 fallos y que sin fallos no aparece el botón.
- [x] 6.3 Comprobar de extremo a extremo la concesión al cerrar sesión (racha diaria, tipos jugados, «Primera misión», «Pleno», «Imparable», «Nivel 2», «Todoterreno»); verificar sembrando progreso en `localStorage` y con los tests de `finish` en verde.

## 7. Integración y documentación

- [x] 7.1 Actualizar `README.md` con la estructura nueva (`engine/`, mapa, retos) y `js/config.js`; verificar que los comandos documentados siguen funcionando.
- [x] 7.2 Pasar `node --test` completo y una prueba manual en 360px, tablet y escritorio de portal → módulo → cada reto → resultados sin errores de consola ni peticiones externas.
- [ ] 7.3 Tras el push a `main`, comprobar que el workflow termina en verde y que el módulo funciona en la URL publicada.
