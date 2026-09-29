# portal Specification

## Purpose
Define el portal de entrada de Rumbo: la pantalla que resume el progreso del alumno y da acceso a los módulos de aprendizaje.

## Requirements

### Requirement: Cabecera con identidad, racha y puntos
El portal SHALL mostrar una cabecera fija con el logo «Rumbo», el chip «1º ESO», la racha diaria y los puntos acumulados. Pulsar el logo SHALL llevar al portal.

#### Scenario: Progreso inicial
- **WHEN** el alumno abre la app sin progreso guardado
- **THEN** la cabecera muestra racha 0 con el texto «días seguidos» y «0 pts»

#### Scenario: Singular de la racha
- **WHEN** la racha guardada es 1
- **THEN** el texto de la racha es «día seguido»

### Requirement: Saludo
El portal SHALL mostrar el título «¡Hola! ¿Qué aprendemos hoy?» y un texto que invita a elegir una misión.

#### Scenario: Visita al portal
- **WHEN** se muestra el portal
- **THEN** aparecen el título y el texto de bienvenida

### Requirement: Tarjeta del módulo Europa
El portal SHALL mostrar una tarjeta del módulo «Países y capitales de Europa» con las etiquetas «Geografía» y «51 países · 4 niveles · 6 retos», la barra «Tu dominio {x}%» y un botón. El botón SHALL decir «¡Empezar!» si el dominio es 0 y «Continuar» si es mayor que 0.

#### Scenario: Sin dominio
- **WHEN** el dominio total guardado es 0
- **THEN** la barra muestra 0% y el botón dice «¡Empezar!»

#### Scenario: Con dominio
- **WHEN** el dominio total guardado es mayor que 0
- **THEN** la barra muestra el porcentaje y el botón dice «Continuar»

#### Scenario: Módulo aún no disponible
- **WHEN** el alumno pulsa el botón de la tarjeta antes de que exista la pantalla del módulo
- **THEN** la app navega a la ruta del módulo, que muestra un aviso de «próximamente» con enlace de vuelta al portal

### Requirement: Tarjeta «Próximamente»
El portal SHALL mostrar una tarjeta discontinua «Más misiones en camino» con el texto «Pronto podrás practicar otras materias desde aquí.».

#### Scenario: Visita al portal
- **WHEN** se muestra el portal
- **THEN** la tarjeta «Próximamente» aparece junto a la del módulo

### Requirement: Rejilla de insignias
El portal SHALL mostrar «Tus insignias» con el contador «{n} de 8» y una tarjeta por cada una de las 8 insignias (Primera misión, Pleno, Imparable, Nivel 2, Nivel 3, Nivel 4, Todoterreno, Maestro de Europa) con glifo, nombre y descripción. Las no ganadas SHALL mostrarse atenuadas.

#### Scenario: Ninguna ganada
- **WHEN** no hay insignias guardadas
- **THEN** el contador dice «0 de 8» y las 8 tarjetas aparecen atenuadas

#### Scenario: Insignia ganada
- **WHEN** el progreso guardado incluye la insignia «Primera misión»
- **THEN** su tarjeta se muestra a color y el contador dice «1 de 8»

### Requirement: Borrar progreso
El portal SHALL ofrecer una acción «Borrar mi progreso» que pida confirmación y, si se confirma, elimine todo el progreso guardado y restablezca el portal a su estado inicial.

#### Scenario: Confirmar borrado
- **WHEN** el alumno confirma el borrado
- **THEN** puntos, racha, dominio e insignias vuelven a su valor inicial y el portal se actualiza

#### Scenario: Cancelar borrado
- **WHEN** el alumno cancela la confirmación
- **THEN** el progreso no cambia
