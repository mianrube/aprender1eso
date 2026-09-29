## ADDED Requirements

### Requirement: Tarjeta del módulo con mapa de dominio
El portal SHALL mostrar una tarjeta del módulo «Países y capitales de Europa» con las etiquetas «Geografía» y «51 países · 4 niveles · 6 retos», la barra «Tu dominio {x}%», un botón y un mapa de dominio de Europa sin interacción que refleje el dominio de cada país. El botón SHALL decir «¡Empezar!» si el dominio es 0 y «Continuar» si es mayor que 0, y SHALL llevar a la pantalla del módulo.

#### Scenario: Sin dominio
- **WHEN** el dominio total guardado es 0
- **THEN** la barra muestra 0%, el botón dice «¡Empezar!» y el mapa aparece sin colorear

#### Scenario: Con dominio
- **WHEN** el dominio total guardado es mayor que 0
- **THEN** la barra muestra el porcentaje, el botón dice «Continuar» y los países con dominio aparecen coloreados según su nivel

#### Scenario: Acceso al módulo
- **WHEN** el alumno pulsa el botón de la tarjeta
- **THEN** la app navega a la pantalla del módulo en `#/europa`

#### Scenario: Mapa sin interacción
- **WHEN** el alumno pulsa o pasa el ratón sobre el mapa de la tarjeta
- **THEN** no ocurre nada: no hay selección, tooltip ni navegación

## REMOVED Requirements

### Requirement: Tarjeta del módulo Europa
**Reason**: La tarjeta pasa a incluir el mapa de dominio y el botón ya no lleva a una pantalla provisional; lo cubre el requisito «Tarjeta del módulo con mapa de dominio».
**Migration**: Sustituir por «Tarjeta del módulo con mapa de dominio». El botón lleva a `#/europa`, que ahora es la pantalla real del módulo.
