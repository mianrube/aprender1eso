# challenge-types Specification

## Purpose
Define el comportamiento de los seis tipos de reto del módulo: Tarjetas, Test, Empareja, Banderas, Mapa y Escribe.

## Requirements

### Requirement: Catálogo de retos
El módulo SHALL ofrecer estos retos, con su etiqueta de dificultad: Tarjetas (Para empezar), Test (Fácil), Empareja (Fácil), Banderas (Medio), Mapa (Medio) y Escribe (Difícil).

#### Scenario: Seis retos
- **WHEN** se muestra la elección de reto
- **THEN** aparecen los seis retos con su etiqueta

### Requirement: Reto Test
En el Test, cada pregunta SHALL tener 4 opciones etiquetadas A–D. El 60% de las preguntas SHALL ser «¿Cuál es la capital de…» + país, con capitales como opciones, y el resto «¿De qué país es capital…» + capital, con países como opciones. Si el nombre de la capital contiene el nombre del país (Luxemburgo, Mónaco, San Marino, Andorra, El Vaticano), la pregunta SHALL ser siempre del primer tipo. Tras responder, la opción correcta SHALL resaltarse en verde, la elegida errónea en rojo y las demás atenuarse.

#### Scenario: Capital con el nombre del país
- **WHEN** la pregunta es sobre Mónaco
- **THEN** se pregunta «¿Cuál es la capital de…» Mónaco, con capitales como opciones

#### Scenario: Corrección visual
- **WHEN** el alumno elige una opción errónea
- **THEN** su opción se ve roja, la correcta verde y las otras atenuadas

#### Scenario: Detalle del fallo en Test
- **WHEN** el alumno falla una pregunta de capital
- **THEN** el detalle es «La capital de X es Y.»

#### Scenario: Detalle del fallo al preguntar el país
- **WHEN** el alumno falla una pregunta de «¿De qué país es capital…?»
- **THEN** el detalle es «Y es la capital de X.»

### Requirement: Reto Banderas
En Banderas, cada pregunta SHALL mostrar una bandera grande con la pregunta «¿De qué país es esta bandera?» y 4 países como opciones. El detalle del fallo SHALL ser «Es la bandera de X.». La bandera SHALL cargarse del propio sitio.

#### Scenario: Pregunta de bandera
- **WHEN** aparece una pregunta de Banderas
- **THEN** se ve la bandera del país y 4 nombres de país

### Requirement: Reto Escribe
En Escribe, cada pregunta SHALL mostrar la bandera pequeña, «Escribe la capital de…» y el país, con un campo de texto que recibe el foco automáticamente, el placeholder «Escribe aquí la capital», el botón «Comprobar» y la ayuda «No hace falta poner tildes. Pulsa Intro para comprobar.». Un campo vacío no SHALL poder comprobarse.

#### Scenario: Foco automático
- **WHEN** aparece una pregunta de Escribe
- **THEN** el campo de texto tiene el foco

#### Scenario: Campo vacío
- **WHEN** el alumno pulsa «Comprobar» sin escribir nada
- **THEN** no se corrige la pregunta

### Requirement: Corrección tolerante en Escribe
La respuesta escrita SHALL compararse tras pasarla a minúsculas y quitar tildes y cualquier carácter que no sea una letra a–z, incluidos los espacios. SHALL aceptarse la capital oficial y sus formas alternativas. Una respuesta a distancia de edición 1 de una forma aceptada cuya longitud normalizada sea mayor de 3 SHALL contar como acierto con aviso de ortografía.

#### Scenario: Sin tildes
- **WHEN** el alumno escribe «parís» o «PARIS» para Francia
- **THEN** cuenta como acierto exacto

#### Scenario: Forma alternativa
- **WHEN** el alumno escribe «Kyiv» para Ucrania
- **THEN** cuenta como acierto

#### Scenario: Error de ortografía
- **WHEN** el alumno escribe «Estocolmo» con una letra cambiada, como «Estocolma»
- **THEN** cuenta como acierto y el detalle es «Se escribe «Estocolmo». ¡Por muy poco!»

#### Scenario: Palabra corta
- **WHEN** el alumno escribe «Rom» para Italia (capital de 4 letras) o «Ros» para Oslo
- **THEN** una palabra de 3 letras o menos exige coincidencia exacta y la de 4 letras admite un error

#### Scenario: Fallo
- **WHEN** el alumno escribe «Lyon» para Francia
- **THEN** el detalle es «La capital de Francia es París. Tú escribiste «Lyon».»

### Requirement: Reto Mapa
En Mapa, el 70% de las preguntas SHALL ser «Toca en el mapa…» + país y el 30% «Toca el país cuya capital es…» + capital. El mapa SHALL ser interactivo mientras no se responda. Al responder, el país correcto SHALL pintarse de verde y el tocado, si es erróneo, de rojo, y los nombres SHALL mostrarse al pasar el ratón. Tocar un país que no está en la lista SHALL ignorarse. El detalle del fallo SHALL ser «Tocaste Z. X es el país en verde.».

#### Scenario: Acierto en el mapa
- **WHEN** el alumno toca el país pedido
- **THEN** ese país se pinta de verde y cuenta como acierto

#### Scenario: Fallo en el mapa
- **WHEN** el alumno toca Italia cuando se pedía España
- **THEN** Italia se pinta de rojo, España de verde y el detalle es «Tocaste Italia. España es el país en verde.»

#### Scenario: Tras responder
- **WHEN** ya se ha respondido
- **THEN** tocar el mapa no cambia la respuesta

### Requirement: Reto Tarjetas
En Tarjetas, cada pregunta SHALL mostrar una tarjeta con la bandera, el país y «¿Cuál es su capital? Toca para girar». Al tocarla, la tarjeta SHALL girar y mostrar en el reverso «Capital de {país}» y la capital. Una vez girada SHALL ofrecer «Aún no me la sé» y «¡Me la sabía!». La autoevaluación SHALL puntuar (5 puntos por acierto), actualizar el dominio y pasar a la siguiente tarjeta sin mostrar el panel de feedback.

#### Scenario: Girar
- **WHEN** el alumno toca la tarjeta
- **THEN** se ve la capital y aparecen los dos botones de autoevaluación

#### Scenario: Me la sabía
- **WHEN** el alumno pulsa «¡Me la sabía!»
- **THEN** suma 5 puntos, el dominio del país sube 1 y aparece la siguiente tarjeta

#### Scenario: Aún no me la sé
- **WHEN** el alumno pulsa «Aún no me la sé»
- **THEN** no suma puntos, el dominio del país baja 1 y aparece la siguiente tarjeta

### Requirement: Reto Empareja
En Empareja, la pantalla SHALL titularse «Une cada país con su capital» con el subtítulo «Toca un país y después su capital.», con dos columnas de 6 elementos: países con bandera a la izquierda y capitales desordenadas a la derecha, que se pueden tocar en cualquier orden. Un elemento seleccionado SHALL destacarse. Una pareja correcta SHALL quedar en verde atenuado y dejar de responder. Una pareja errónea SHALL parpadear en rojo 650 ms y deseleccionarse. Cada país cuenta como acierto solo si se empareja sin haber fallado antes; el fallo previo lo cuenta como error. Al completar las 6 parejas, la sesión SHALL pasar a los resultados tras 600 ms. Si el conjunto de países disponibles es menor de 4, SHALL completarse con países del nivel hasta 4.

#### Scenario: Pareja correcta
- **WHEN** el alumno toca «España» y luego «Madrid»
- **THEN** ambos quedan en verde atenuado y ya no responden

#### Scenario: Pareja errónea
- **WHEN** el alumno toca «España» y luego «Lisboa»
- **THEN** ambos parpadean en rojo 650 ms y se deseleccionan

#### Scenario: Acierto tras un fallo
- **WHEN** el alumno falla con España y después la empareja bien
- **THEN** España cuenta como error en la sesión y su dominio baja 1

#### Scenario: Completar
- **WHEN** el alumno empareja las 6 parejas
- **THEN** a los 600 ms se muestran los resultados

#### Scenario: Orden libre
- **WHEN** el alumno toca primero una capital y después un país
- **THEN** la pareja se evalúa igual

### Requirement: Repaso de fallos
Un reto lanzado como «Repaso de fallos» SHALL usar exactamente los países indicados (sin ponderar por dominio), en orden aleatorio, y SHALL mostrar el chip «Repaso de fallos» en lugar del nivel. En Empareja, SHALL usar hasta 6 de esos países.

#### Scenario: Repasar
- **WHEN** se lanza un repaso con 3 países
- **THEN** la sesión tiene 3 preguntas, una por país

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
