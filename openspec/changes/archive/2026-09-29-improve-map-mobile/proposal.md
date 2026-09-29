# Proposal

## Why

En un móvil el reto Mapa es casi injugable para los países pequeños. Medido con el mapa a 360 px de ancho (escala 0,393): los 7 microestados son círculos de 4 px, 39 de los 51 países miden menos de 44 px en su lado mayor y 26 menos de 24 px (Kosovo 9, Chipre 9, Montenegro 10, Macedonia 11, Eslovenia 12, Bélgica 13). Un dedo no puede acertar de forma fiable y el alumno falla por la interfaz, no por no saber la respuesta.

## What Changes

- **Zoom y desplazamiento** del mapa en el reto Mapa: botones «+», «−» y «Restablecer», pellizco de dos dedos y arrastre con un dedo (o el ratón) cuando hay zoom, con límites de ampliación y de desplazamiento para no perder el mapa.
- **Zonas táctiles ampliadas** para los países que se ven pequeños: un toque cerca de un país pequeño (radio cómodo en píxeles de pantalla, independiente del zoom) se resuelve al más cercano, sobre todo para los microestados.
- **Toque frente a gesto:** un arrastre o un pellizco nunca responden la pregunta; solo cuenta un toque corto y casi sin movimiento.
- **Encuadre más ajustado** del mapa completo: se recortan los márgenes vacíos (Atlántico, sur del Mediterráneo, este de Rusia y Kazajistán) que la geometría actual reserva. Medido, esto gana solo un ~10 % de escala en móvil; la mejora importante viene del zoom y las zonas táctiles.
- **Tras responder**, el mapa se desplaza lo justo para que el país correcto y el tocado queden visibles aunque haya zoom.
- El mapa de la tarjeta del portal y el del módulo no cambian de comportamiento (sin zoom ni interacción).
- **Lista de dominio en orden alfabético:** «Tu dominio país a país» pasa del orden por niveles al orden alfabético español (sin que las tildes alteren el orden y con «El Vaticano» en la V).

Rusia y Kazajistán son más grandes que el mapa y ya quedan cortados por el borde; siguen visibles y tocables. No se hace zoom con la rueda del ratón ni navegación con teclado sobre los países.

## Capabilities

### New Capabilities

### Modified Capabilities
- `europe-map`: añade zoom y desplazamiento, zonas táctiles ampliadas, distinción entre toque y gesto, encuadre ajustado y traer marcas a la vista; ajusta «Interacción opcional» para que el país notificado sea el resuelto tras la tolerancia táctil.
- `challenge-types`: el reto Mapa ofrece zoom y muestra el país correcto tras responder.
- `europa-module`: la lista de dominio país a país se ordena alfabéticamente.

## Impact

- Código: `js/ui/europe-map.js` (gestos, vista, zonas táctiles), nuevo módulo de lógica pura `js/lib/map-view.js` con vista, límites, toque frente a gesto y resolución del país más cercano, `js/lib/sort.js` para el orden alfabético, `js/ui/module.js` (lista ordenada), `js/ui/play/mapa.js` (activar zoom y traer marcas a la vista) y `css/components.css` / `css/play.css` (controles de zoom).
- Tests nuevos con `node --test` para la lógica pura; verificación en navegador con emulación móvil.
- Sin dependencias nuevas ni cambios en el despliegue.
