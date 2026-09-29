## MODIFIED Requirements

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
