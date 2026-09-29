## Purpose

Define el mapa de Europa reutilizable de Rumbo, que muestra el dominio de cada país y permite tocar países en el reto de Mapa, sin depender de servicios externos.

## ADDED Requirements

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
El mapa SHALL notificar el país pulsado solo cuando sea interactivo, y mostrar el cursor y el atenuado al pasar el ratón solo en ese caso. Un mapa no interactivo SHALL ignorar clics.

#### Scenario: Mapa no interactivo
- **WHEN** el alumno pulsa un país en un mapa no interactivo
- **THEN** no se notifica ningún país

### Requirement: Autocontenido y adaptable
El mapa SHALL cargar su geometría desde ficheros del propio sitio, mantener su proporción dentro del contenedor que lo aloje y mostrar un texto «Cargando mapa…» hasta estar listo. Si la geometría no carga, SHALL mostrar un mensaje de error en su lugar y no impedir el resto de la pantalla.

#### Scenario: Carga correcta
- **WHEN** se muestra un mapa
- **THEN** aparece «Cargando mapa…» y, al terminar, el mapa

#### Scenario: Fallo de carga
- **WHEN** el fichero de geometría no se puede cargar
- **THEN** el mapa muestra un mensaje de error y el resto de la pantalla sigue funcionando
