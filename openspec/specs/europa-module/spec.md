# europa-module Specification

## Purpose
Define la pantalla del módulo «Países y capitales de Europa»: el punto desde el que el alumno ve su dominio, elige nivel y reto, y consulta su progreso país a país.

## Requirements

### Requirement: Cabecera del módulo
La pantalla del módulo en `#/europa` SHALL mostrar el enlace «← Volver al portal», la etiqueta «Geografía», el título «Países y capitales de Europa» y la barra «Dominio total» con su porcentaje.

#### Scenario: Volver al portal
- **WHEN** el alumno pulsa «← Volver al portal»
- **THEN** la app muestra el portal

#### Scenario: Dominio total
- **WHEN** los 51 países tienen dominio medio del 50%
- **THEN** la barra «Dominio total» muestra 50%

### Requirement: Mapa de dominio con leyenda
La pantalla SHALL mostrar el mapa de Europa coloreado según el dominio de cada país, con tooltip «País · Capital» al pasar el ratón y una leyenda «Sin empezar / Aprendiendo / Casi / Dominado».

#### Scenario: Tooltip
- **WHEN** el alumno pasa el ratón por Francia
- **THEN** aparece «Francia · París»

### Requirement: Niveles y desbloqueo
La pantalla SHALL listar los 4 niveles (Europa occidental, Norte y este, Sur y Balcanes, Microestados y Cáucaso) con su porcentaje de dominio, la lista de sus países y una barra de progreso. El nivel 1 SHALL estar siempre desbloqueado. El nivel N SHALL desbloquearse cuando el dominio medio del nivel N−1 sea igual o superior al 60%. Un nivel bloqueado SHALL mostrarse atenuado con el estado «Bloqueado» y el texto «Consigue un 60% en el nivel N-1 para desbloquearlo.», y no SHALL poder seleccionarse.

#### Scenario: Nivel 2 bloqueado
- **WHEN** el dominio medio del nivel 1 es del 59%
- **THEN** el nivel 2 aparece bloqueado y no se puede seleccionar

#### Scenario: Nivel 2 desbloqueado
- **WHEN** el dominio medio del nivel 1 es del 60%
- **THEN** el nivel 2 muestra su porcentaje y se puede seleccionar

#### Scenario: Selección
- **WHEN** el alumno selecciona el nivel 3 desbloqueado
- **THEN** su tarjeta se destaca con el color del nivel y los retos pasan a ser «Nivel 3»

#### Scenario: Nivel por defecto
- **WHEN** el alumno entra al módulo por primera vez
- **THEN** el nivel seleccionado es el 1

### Requirement: Elección de reto
La pantalla SHALL mostrar 6 tarjetas de reto (Tarjetas, Test, Empareja, Banderas, Mapa, Escribe) con icono, etiqueta de dificultad, nombre y descripción, bajo el título «2. Elige un reto · Nivel N». Pulsar una tarjeta SHALL iniciar una sesión de ese reto con el nivel seleccionado.

#### Scenario: Empezar un reto
- **WHEN** el alumno pulsa la tarjeta «Test» con el nivel 2 seleccionado
- **THEN** empieza una sesión de Test con países del nivel 2

### Requirement: Dominio país a país
La pantalla SHALL mostrar los 51 países con su bandera, nombre, capital y 5 segmentos que indican su dominio, ordenados alfabéticamente por nombre según el español (sin que las tildes alteren el orden, y ordenando «El Vaticano» por «Vaticano»). El segmento vacío SHALL ser gris; los llenos, amarillos con dominio 1–2, verde claro con 3–4 y verde intenso con 5. Si la opción de mostrar capitales está desactivada, la capital SHALL ocultarse como «???» hasta que el país llegue a dominio 3.

#### Scenario: Dominio parcial
- **WHEN** un país tiene dominio 2
- **THEN** se ven 2 segmentos amarillos y 3 grises

#### Scenario: Capitales ocultas
- **WHEN** las capitales están ocultas y un país tiene dominio 2
- **THEN** su capital se muestra como «???»

#### Scenario: Orden alfabético
- **WHEN** se muestra la lista de dominio
- **THEN** los países aparecen en orden alfabético, con «Albania» el primero, sin depender del nivel al que pertenecen

#### Scenario: Tildes
- **WHEN** se ordenan «Bélgica» y «Bielorrusia»
- **THEN** «Bélgica» aparece antes que «Bielorrusia», porque la tilde no altera el orden

#### Scenario: Artículo inicial
- **WHEN** se ordena «El Vaticano»
- **THEN** aparece en la V, después de «Ucrania», y no en la E

### Requirement: Estado recordado
Al volver al módulo desde un reto o desde los resultados, la pantalla SHALL conservar el nivel que estaba seleccionado.

#### Scenario: Elegir otro reto
- **WHEN** el alumno termina un reto de nivel 2 y pulsa «Elegir otro reto»
- **THEN** el módulo se muestra con el nivel 2 seleccionado

### Requirement: Opción «Todos los países»
Además de los 4 niveles, la pantalla SHALL ofrecer una quinta opción «Todos los países» con los 51 países mezclados, con su porcentaje de dominio total. Esta opción SHALL estar siempre disponible, sin requisitos de desbloqueo, y SHALL no afectar al desbloqueo de los niveles ni a sus insignias, que siguen dependiendo del dominio de cada nivel. Al seleccionarla, el título de los retos SHALL ser «2. Elige un reto · Todos los países».

#### Scenario: Siempre disponible
- **WHEN** el alumno abre el módulo sin ningún progreso
- **THEN** la opción «Todos los países» se puede seleccionar

#### Scenario: Sesión mezclada
- **WHEN** el alumno inicia un reto con «Todos los países»
- **THEN** las preguntas se eligen entre los 51 países, ponderadas por su falta de dominio

#### Scenario: Niveles independientes
- **WHEN** el alumno practica solo con «Todos los países» y el nivel 1 llega al 60%
- **THEN** el nivel 2 se desbloquea igual que si hubiera practicado el nivel 1
