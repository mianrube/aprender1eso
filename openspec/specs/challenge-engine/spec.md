# challenge-engine Specification

## Purpose
Define el motor común de las sesiones de reto: cómo se eligen las preguntas, cómo se puntúa y se registra el dominio, cómo se corrige y cómo se navega, con independencia del tipo de reto.

## Requirements

### Requirement: Inicio de sesión
Una sesión SHALL crearse con un tipo de reto y un nivel, y SHALL contener hasta 8 preguntas. Los países SHALL elegirse del nivel seleccionado (o de los 51 si se eligió «Todos los países») con probabilidad ponderada por la falta de dominio, de modo que los menos dominados salgan más a menudo, sin repetir país dentro de la sesión. Si el nivel tiene menos países que preguntas, SHALL usar todos.

#### Scenario: Tamaño de la sesión
- **WHEN** se inicia un Test en un nivel con 13 países
- **THEN** la sesión tiene 8 preguntas de países distintos

#### Scenario: Peso por dominio
- **WHEN** se generan muchas sesiones con un país en dominio 0 y otro en dominio 5
- **THEN** el país en dominio 0 aparece con más frecuencia que el de dominio 5

#### Scenario: Nivel pequeño
- **WHEN** el nivel tiene 9 países
- **THEN** la sesión tiene 8 preguntas

### Requirement: Distractores
Las opciones de respuesta SHALL incluir el país correcto y 3 países distintos elegidos al azar entre los 51, en orden aleatorio, sin repetidos.

#### Scenario: Opciones válidas
- **WHEN** se genera una pregunta de opciones
- **THEN** hay 4 opciones distintas y exactamente una es la correcta

### Requirement: Puntuación y racha de sesión
Un acierto SHALL sumar 10 puntos (5 en Tarjetas). Si la racha de aciertos seguidos dentro de la sesión, incluido el acierto actual, es de 3 o más, SHALL sumar además 5 puntos. Un fallo SHALL no sumar puntos y reiniciar la racha de sesión. La sesión SHALL recordar su mejor racha.

#### Scenario: Acierto normal
- **WHEN** el alumno acierta con una racha de sesión de 1
- **THEN** suma 10 puntos

#### Scenario: Bonus por racha
- **WHEN** el alumno acierta por tercera vez seguida
- **THEN** suma 15 puntos

#### Scenario: Fallo
- **WHEN** el alumno falla tras 4 aciertos seguidos
- **THEN** no suma puntos y su racha de sesión vuelve a 0, manteniéndose la mejor racha en 4

### Requirement: Dominio por país
Cada respuesta SHALL modificar el dominio del país preguntado: +1 si acierta y −1 si falla, siempre entre 0 y 5. El dominio y los puntos SHALL guardarse en el progreso en el momento de responder.

#### Scenario: Límites
- **WHEN** el alumno falla un país con dominio 0 o acierta uno con dominio 5
- **THEN** el dominio se mantiene en 0 o en 5 respectivamente

#### Scenario: Guardado inmediato
- **WHEN** el alumno responde una pregunta y recarga la página
- **THEN** el dominio y los puntos ganados en esa respuesta se conservan

### Requirement: Barra superior de la sesión
Durante un reto, la pantalla SHALL mostrar un botón ✕, una barra de progreso, el chip «racha x{n}» cuando la racha de sesión sea de 2 o más, un chip «+{puntos}» con los puntos de la sesión, el chip del tipo de reto y el chip «Nivel N» o «Repaso de fallos». La barra SHALL avanzar con cada pregunta respondida.

#### Scenario: Progreso
- **WHEN** el alumno ha respondido 4 de 8 preguntas
- **THEN** la barra está al 50%

#### Scenario: Chip de racha
- **WHEN** la racha de sesión es 1
- **THEN** no se muestra el chip «racha»

### Requirement: Panel de feedback
Tras responder en los retos con corrección, un panel fijo en la parte inferior SHALL indicar el resultado con verde para el acierto y rojo para el fallo, un título elegido al azar y un detalle. Títulos de acierto: «¡Correcto!», «¡Eso es!», «¡Bien visto!», «¡Crack!», «¡Perfecto!». Títulos de fallo: «¡Casi!», «¡Uy! No era esa», «A la próxima». El detalle del acierto SHALL ser «+{p} puntos», añadiendo « · ¡llevas N seguidas!» con racha de 3 o más. El detalle del fallo SHALL explicar la respuesta correcta según el reto. El panel SHALL incluir un botón «Siguiente».

#### Scenario: Acierto con racha
- **WHEN** el alumno acierta por cuarta vez seguida
- **THEN** el panel es verde y su detalle es «+15 puntos · ¡llevas 4 seguidas!»

#### Scenario: Fallo
- **WHEN** el alumno falla
- **THEN** el panel es rojo y explica la respuesta correcta

### Requirement: Avance con Intro
La tecla Intro SHALL enviar la respuesta en el reto Escribe y pasar a la siguiente pregunta cuando el panel de feedback esté visible. Intro SHALL no hacer nada en Tarjetas ni en Empareja.

#### Scenario: Siguiente con Intro
- **WHEN** el panel de feedback está visible y el alumno pulsa Intro
- **THEN** aparece la siguiente pregunta

### Requirement: Última pregunta
Al pulsar «Siguiente» en la última pregunta, la sesión SHALL terminar y mostrar los resultados.

#### Scenario: Fin de sesión
- **WHEN** el alumno pulsa «Siguiente» en la pregunta 8 de 8
- **THEN** se muestran los resultados

### Requirement: Abandono
El botón ✕ SHALL abandonar la sesión y volver al módulo sin marcarla como terminada: no SHALL actualizar la racha diaria, los tipos de reto jugados ni las insignias, pero el dominio y los puntos ya ganados SHALL conservarse.

#### Scenario: Abandonar a mitad
- **WHEN** el alumno responde 3 preguntas y pulsa ✕
- **THEN** vuelve al módulo, conserva el dominio y los puntos de esas 3 respuestas y su racha diaria no cambia

### Requirement: Rutas de la sesión
Las pantallas de reto y resultados SHALL estar en `#/europa/reto` y `#/europa/resultados`, y la sesión SHALL vivir solo en memoria. Si se accede a una de esas rutas sin sesión activa (por ejemplo, tras recargar la página), la app SHALL volver al módulo.

#### Scenario: Recarga en mitad de un reto
- **WHEN** el alumno recarga la página en `#/europa/reto`
- **THEN** la app muestra el módulo y el progreso ya guardado se conserva

### Requirement: Cabecera oculta durante el juego
La cabecera general con logo, racha y puntos SHALL mostrarse en el portal y en el módulo, y SHALL no mostrarse durante el reto ni en los resultados.

#### Scenario: Dentro de un reto
- **WHEN** hay un reto en curso
- **THEN** no se ve la cabecera general
