## ADDED Requirements

### Requirement: Reto Mapa con zoom
El reto Mapa SHALL ofrecer zoom y desplazamiento del mapa con las reglas del mapa con zoom, conservando la ampliación entre preguntas de una misma sesión. Al responder, el país correcto y, si fue un fallo, el país tocado SHALL quedar visibles. Un arrastre o un pellizco sobre el mapa SHALL no contar como respuesta.

#### Scenario: Zoom conservado
- **WHEN** el alumno amplía los Balcanes y pasa a la siguiente pregunta
- **THEN** el mapa mantiene la ampliación

#### Scenario: Corrección visible
- **WHEN** el alumno, con el mapa ampliado sobre Iberia, toca un país de los Balcanes y falla
- **THEN** tras responder se ven a la vez el país correcto en verde y el tocado en rojo

#### Scenario: Arrastrar no responde
- **WHEN** el alumno arrastra el mapa sin soltar sobre ningún país en un toque corto
- **THEN** la pregunta sigue sin responder

#### Scenario: Toque en país pequeño
- **WHEN** la pregunta es Andorra y el alumno toca a menos de 20 px de su círculo en la vista completa
- **THEN** cuenta como acierto
