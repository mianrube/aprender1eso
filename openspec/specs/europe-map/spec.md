# europe-map Specification

## Purpose
Define el mapa de Europa reutilizable de Rumbo, que muestra el dominio de cada país y permite tocar países en el reto de Mapa, sin depender de servicios externos.

## Requirements

### Requirement: Mapa de Europa con los 51 países
El mapa SHALL representar Europa con proyección azimutal centrada en el continente y cada uno de los 51 países del módulo SHALL poder identificarse, colorearse y, si el mapa es interactivo, tocarse. Los países que no forman parte de la lista SHALL dibujarse en un tono neutro y sin interacción, y el mar en azul claro.

#### Scenario: Países de la lista
- **WHEN** se dibuja el mapa
- **THEN** existe un elemento por cada uno de los 51 países de la lista, identificado por su código iso2

#### Scenario: Países fuera de la lista
- **WHEN** se dibuja el mapa
- **THEN** los países que no están en la lista aparecen en color neutro y no responden a pulsaciones

### Requirement: Casos especiales de geometría
Los microestados (Malta, Luxemburgo, Andorra, Liechtenstein, Mónaco, San Marino y el Vaticano) SHALL dibujarse como círculos tocables en sus coordenadas. Kosovo, Macedonia, Montenegro, Bosnia y Herzegovina y Chipre SHALL identificarse aunque la geometría de origen no los incluya con código numérico propio; la parte norte de Chipre SHALL contar como Chipre.

#### Scenario: Microestado tocable
- **WHEN** el mapa es interactivo y el alumno pulsa el círculo de Andorra
- **THEN** se notifica el país Andorra

#### Scenario: Kosovo
- **WHEN** se dibuja el mapa
- **THEN** Kosovo es un país identificable, coloreable y tocable

### Requirement: Relleno por dominio
El mapa SHALL colorear cada país según un valor de dominio de 0 a 5 con la escala: blanco, amarillo claro, amarillo, verde claro, verde medio y verde intenso. Los cambios de relleno SHALL animarse suavemente.

#### Scenario: Dominio 5
- **WHEN** un país tiene dominio 5
- **THEN** se rellena de verde intenso

#### Scenario: Dominio 0
- **WHEN** un país tiene dominio 0
- **THEN** se rellena de blanco

### Requirement: Marcas de acierto y fallo
El mapa SHALL poder marcar países como acierto (verde) o fallo (rojo) con un trazo más grueso, y las marcas SHALL quedar por encima del resto de países.

#### Scenario: Fallo con corrección
- **WHEN** se marca el país tocado como fallo y el correcto como acierto
- **THEN** el tocado se ve en rojo, el correcto en verde y ambos con trazo destacado

### Requirement: Tooltip con nombres
Cuando el mapa tenga activados los nombres, al pasar el puntero por un país SHALL mostrarse un tooltip con el texto que se haya indicado para ese país, sin salirse de la ventana. Si los nombres están desactivados, no SHALL mostrarse ningún tooltip.

#### Scenario: Módulo
- **WHEN** el alumno pasa el ratón por España en el mapa de la pantalla del módulo
- **THEN** aparece el tooltip «España · Madrid»

#### Scenario: Antes de responder
- **WHEN** el mapa está en un reto de Mapa sin responder
- **THEN** no se muestra ningún nombre

### Requirement: Interacción opcional
El mapa SHALL notificar el país pulsado solo cuando sea interactivo, y mostrar el cursor y el atenuado al pasar el ratón solo en ese caso. El país notificado SHALL ser el que resulta de aplicar la tolerancia táctil a los países pequeños. Un mapa no interactivo SHALL ignorar clics y toques.

#### Scenario: Mapa no interactivo
- **WHEN** el alumno pulsa un país en un mapa no interactivo
- **THEN** no se notifica ningún país

#### Scenario: País resuelto por tolerancia
- **WHEN** el alumno toca cerca de Andorra en un mapa interactivo, dentro de la tolerancia táctil
- **THEN** se notifica Andorra

### Requirement: Autocontenido y adaptable
El mapa SHALL cargar su geometría desde ficheros del propio sitio, mantener su proporción dentro del contenedor que lo aloje y mostrar un texto «Cargando mapa…» hasta estar listo. Si la geometría no carga, SHALL mostrar un mensaje de error en su lugar y no impedir el resto de la pantalla.

#### Scenario: Carga correcta
- **WHEN** se muestra un mapa
- **THEN** aparece «Cargando mapa…» y, al terminar, el mapa

#### Scenario: Fallo de carga
- **WHEN** el fichero de geometría no se puede cargar
- **THEN** el mapa muestra un mensaje de error y el resto de la pantalla sigue funcionando

### Requirement: Zoom y desplazamiento opcionales
Un mapa SHALL poder crearse con zoom activado. Con zoom activado SHALL mostrar los botones «+», «−» y «Restablecer vista», de al menos 44 px, y SHALL permitir ampliar con el pellizco de dos dedos y desplazar el mapa arrastrando con un dedo o el ratón cuando la vista está ampliada. La ampliación SHALL estar limitada entre la vista completa (1×) y 8×. El mapa SHALL animar los cambios de vista de los botones. Los mapas sin zoom activado (tarjeta del portal y pantalla del módulo) SHALL comportarse como hasta ahora.

#### Scenario: Ampliar con el botón
- **WHEN** el alumno pulsa «+» en la vista completa
- **THEN** el mapa se amplía y el país central sigue visible

#### Scenario: Límite de ampliación
- **WHEN** el alumno pulsa «+» repetidamente
- **THEN** la ampliación se detiene en 8×

#### Scenario: Límite inferior
- **WHEN** el alumno pulsa «−» estando en la vista completa
- **THEN** la vista no cambia

#### Scenario: Restablecer
- **WHEN** el alumno pulsa «Restablecer vista» con el mapa ampliado y desplazado
- **THEN** el mapa vuelve a la vista completa

#### Scenario: Pellizco
- **WHEN** el alumno separa dos dedos sobre los Balcanes
- **THEN** el mapa se amplía alrededor del punto medio de los dedos

#### Scenario: Arrastrar con zoom
- **WHEN** el mapa está ampliado y el alumno arrastra un dedo
- **THEN** el mapa se desplaza siguiendo al dedo

#### Scenario: Sin zoom
- **WHEN** se muestra el mapa de la tarjeta del portal
- **THEN** no aparecen botones de zoom y el mapa no responde a pellizcos ni arrastres

### Requirement: Desplazamiento acotado
El mapa SHALL impedir que la vista se aleje del contenido: al desplazar o ampliar, la parte visible SHALL quedar siempre dentro de los límites del mapa, y a 1× SHALL mostrarse centrado.

#### Scenario: Arrastre hacia el borde
- **WHEN** el mapa está ampliado y el alumno arrastra hasta pasar el borde del mapa
- **THEN** la vista se detiene en el borde y no muestra espacio vacío más allá

### Requirement: Zonas táctiles ampliadas
En un mapa interactivo, un toque SHALL atribuirse a un país por capas: (1) un microestado a menos de 10 px de pantalla del toque gana siempre; (2) si no, gana el país pequeño que esté bajo el dedo; (3) si no, gana el país pequeño más cercano a menos de 20 px de pantalla; (4) si no, el país que esté bajo el dedo. Un país es pequeño cuando en pantalla mide menos de 28 px en su lado mayor con la ampliación actual, y los microestados lo son mientras su círculo mida menos de 28 px. Con más ampliación menos países son pequeños y la tolerancia desaparece.

#### Scenario: Microestado junto a un país grande
- **WHEN** el alumno toca a 8 px de pantalla del círculo de Andorra, sobre España
- **THEN** se notifica Andorra

#### Scenario: Microestado frente a un país pequeño
- **WHEN** el alumno toca a 8 px de pantalla de Luxemburgo, dentro de Bélgica
- **THEN** se notifica Luxemburgo

#### Scenario: País pequeño más lejos que el radio corto
- **WHEN** el alumno toca a 15 px de Luxemburgo, dentro de Bélgica
- **THEN** se notifica Bélgica

#### Scenario: Entre dos microestados
- **WHEN** el alumno toca entre San Marino y el Vaticano
- **THEN** se notifica el más cercano de los dos

#### Scenario: País pequeño cercano
- **WHEN** el alumno toca a 10 px de Kosovo, sobre un país grande
- **THEN** se notifica Kosovo

#### Scenario: Lejos de los pequeños
- **WHEN** el alumno toca en medio de Alemania a más de 20 px de cualquier país pequeño
- **THEN** se notifica Alemania

#### Scenario: Con zoom
- **WHEN** el mapa está ampliado hasta que Bélgica mide 28 px o más
- **THEN** un toque cerca de Bélgica pero dentro de Francia se notifica como Francia

### Requirement: Toque frente a gesto
El mapa SHALL notificar un país solo ante un toque corto: pulsación y suelta del mismo dedo con un movimiento menor de 8 px y sin haber intervenido un segundo dedo. Un arrastre, un pellizco o un movimiento mayor SHALL no notificar ningún país.

#### Scenario: Arrastre no responde
- **WHEN** el alumno arrastra el mapa 40 px sobre un país y suelta
- **THEN** no se notifica ningún país

#### Scenario: Pellizco no responde
- **WHEN** el alumno hace un pellizco que termina sobre un país
- **THEN** no se notifica ningún país

#### Scenario: Toque con temblor
- **WHEN** el alumno toca un país y el dedo se mueve 3 px antes de soltar
- **THEN** se notifica ese país

### Requirement: Encuadre ajustado
La vista completa (1×) SHALL ajustarse a los países de la lista, sin los márgenes vacíos que reservaba el encuadre anterior, y todos los países de la lista SHALL seguir visibles y tocables. Rusia y Kazajistán, que son más grandes que el mapa, SHALL seguir mostrándose parcialmente.

#### Scenario: Países visibles
- **WHEN** se muestra el mapa a 1×
- **THEN** cada uno de los 51 países tiene una parte visible

#### Scenario: Escala mayor
- **WHEN** se muestra el mapa a 1× en un contenedor de 314 px de ancho
- **THEN** la escala es mayor que con el encuadre anterior

### Requirement: Traer marcas a la vista
Cuando se marquen países como acierto o fallo en un mapa con zoom, la vista SHALL desplazarse y ampliarse lo mínimo necesario para que todos los países marcados queden visibles, y SHALL dejarse igual si ya lo estaban.

#### Scenario: País correcto fuera de la vista
- **WHEN** el mapa está ampliado sobre Iberia y se marca como acierto un país de los Balcanes
- **THEN** la vista se mueve para mostrar el país marcado

#### Scenario: Ya visibles
- **WHEN** los países marcados ya están dentro de la vista
- **THEN** la vista no cambia
