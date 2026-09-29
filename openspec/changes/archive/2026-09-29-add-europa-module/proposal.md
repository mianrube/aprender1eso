# Proposal

## Why

La base de Rumbo ya está desplegada, pero al pulsar «¡Empezar!» solo aparece una pantalla «Próximamente». El valor de la app está en el módulo «Países y capitales de Europa»: practicar los 51 países de la lista de clase con retos variados, ver el progreso en un mapa y ganar puntos, racha e insignias. Sin él, el portal, el store y las insignias no se pueden usar de verdad.

## What Changes

- Componente de mapa de Europa nativo (SVG con d3-geo y world-atlas vendorizados, sin iframe), con relleno por dominio, microestados como círculos, tooltip, marcas de acierto/fallo y modo interactivo.
- Pantalla del módulo en `#/europa` (sustituye a la pantalla provisional): mapa de dominio con leyenda, 4 niveles con desbloqueo, 6 tarjetas de reto y lista de dominio país a país con banderas.
- Motor de retos genérico sobre pares pregunta–respuesta: selección ponderada de preguntas, distractores, puntos, dominio, panel de feedback y atajo Intro.
- Los 6 retos: Tarjetas, Test, Empareja, Banderas, Mapa y Escribe.
- Pantalla de resultados: titular, datos, insignias nuevas, lista «Para repasar» y botones de repaso, repetición y cambio de reto.
- Al terminar una sesión se actualizan racha diaria, tipos de reto jugados e insignias con la lógica ya existente.
- La tarjeta del módulo en el portal muestra el mapa de dominio (sin interacción).
- Rutas nuevas `#/europa/reto` y `#/europa/resultados`; la sesión de reto vive solo en memoria.
- Parámetros de diseño en un único fichero de configuración: preguntas por sesión (8), umbral de desbloqueo (60 %) y mostrar capitales (sí).

Fuera de alcance: más módulos, ajustes visibles para el alumnado (los parámetros son constantes), geometría 50m y navegación con teclado sobre el mapa.

## Capabilities

### New Capabilities
- `europe-map`: mapa SVG de Europa reutilizable, con rellenos, marcas, tooltip e interacción opcional.
- `europa-module`: pantalla del módulo: mapa de dominio, niveles y desbloqueo, selección de reto y lista de dominio por país.
- `challenge-engine`: sesiones de reto: selección de preguntas, puntuación, dominio, feedback, navegación y abandono.
- `challenge-types`: comportamiento de los 6 tipos de reto.
- `challenge-results`: resultados de la sesión, repaso de fallos y concesión de insignias, racha y tipos jugados.

### Modified Capabilities
- `portal`: la tarjeta del módulo Europa pasa a incluir el mapa de dominio y su botón lleva al módulo real (desaparece el escenario de módulo provisional).

## Impact

- Código nuevo en `js/engine/`, `js/ui/` (mapa, módulo, retos, resultados), `js/config.js` y `css/`; cambios en `js/main.js`, `js/ui/home.js` y `js/ui/module-stub.js` (se elimina).
- Sin dependencias nuevas: usa `vendor/d3-geo`, `vendor/topojson-client` y `vendor/world-atlas` ya incluidos.
- El store y la lógica de `js/lib/` se reutilizan; se añade lógica pura nueva con pruebas en `tests/`.
- Sin cambios en el workflow de despliegue: cada push a `main` publica el resultado.
