# challenge-results Specification

## Purpose
Define lo que ocurre al terminar una sesión de reto: la pantalla de resultados, el repaso de fallos y la actualización de racha diaria, tipos jugados e insignias.

## Requirements

### Requirement: Cierre de sesión
Al terminar una sesión, la app SHALL actualizar la racha diaria (con las reglas del progreso), registrar el tipo de reto jugado sin duplicados y conceder las insignias que correspondan y que el alumno aún no tuviera, guardándolo todo en el progreso.

#### Scenario: Primera sesión
- **WHEN** el alumno termina su primera sesión
- **THEN** la racha es 1, el tipo de reto queda registrado y gana «Primera misión»

#### Scenario: Pleno
- **WHEN** el alumno termina una sesión sin ningún fallo
- **THEN** gana «Pleno»

#### Scenario: Imparable
- **WHEN** la mejor racha de la sesión es de 5 o más aciertos
- **THEN** gana «Imparable»

#### Scenario: Desbloqueo de nivel
- **WHEN** la sesión hace que el dominio medio del nivel 1 llegue al 60%
- **THEN** gana «Nivel 2»

#### Scenario: Todoterreno
- **WHEN** el alumno ha terminado sesiones de los 6 tipos de reto
- **THEN** gana «Todoterreno»

#### Scenario: Maestro de Europa
- **WHEN** los 51 países alcanzan dominio 5
- **THEN** gana «Maestro de Europa»

#### Scenario: Sin duplicados
- **WHEN** el alumno ya tenía una insignia y vuelve a cumplir su condición
- **THEN** no se concede de nuevo ni se anuncia como nueva

### Requirement: Pantalla de resultados
La pantalla en `#/europa/resultados` SHALL mostrar el chip «{Tipo} · {Nivel}», el titular, «Has acertado X de Y» y tres tarjetas: Aciertos (%), Puntos (+n) y Mejor racha. El titular SHALL ser «¡Brutal!» con un 90% de aciertos o más, «¡Muy bien!» con un 60% o más y «¡Sigue así!» por debajo. En un repaso, el chip SHALL indicar «Repaso de fallos» en lugar del nivel, y con la opción «Todos los países» SHALL indicar «Todos los países».

#### Scenario: Titular brutal
- **WHEN** el alumno acierta 8 de 8
- **THEN** el titular es «¡Brutal!»

#### Scenario: Titular muy bien
- **WHEN** el alumno acierta 5 de 8 (62%)
- **THEN** el titular es «¡Muy bien!»

#### Scenario: Titular sigue así
- **WHEN** el alumno acierta 3 de 8
- **THEN** el titular es «¡Sigue así!»

#### Scenario: Datos
- **WHEN** el alumno acierta 6 de 8 con 65 puntos y mejor racha 4
- **THEN** las tarjetas muestran 75%, +65 y 4

### Requirement: Insignias nuevas
Si la sesión concede insignias, los resultados SHALL mostrar un panel «¡Insignia nueva!» con cada una (círculo con su glifo y su nombre). Si no concede ninguna, el panel no SHALL aparecer.

#### Scenario: Con insignia
- **WHEN** la sesión concede «Pleno»
- **THEN** aparece el panel con «Pleno»

#### Scenario: Sin insignia
- **WHEN** la sesión no concede ninguna
- **THEN** no hay panel de insignias

### Requirement: Para repasar
Los resultados SHALL listar, sin repetir, cada país fallado con su bandera, «País → Capital» y, si el alumno dio una respuesta, «Tu respuesta: …». Si no hubo fallos, la sección no SHALL aparecer.

#### Scenario: País fallado dos veces
- **WHEN** el alumno falla el mismo país dos veces en la sesión
- **THEN** aparece una sola vez en la lista

### Requirement: Acciones de los resultados
Los resultados SHALL ofrecer «Repasar fallos» (solo si hay fallos), que lanza el mismo tipo de reto solo con los países fallados; «Otra vez», que repite el mismo reto y nivel (o el mismo repaso, si lo era); y «Elegir otro reto», que vuelve al módulo con el mismo nivel seleccionado.

#### Scenario: Repasar fallos
- **WHEN** el alumno pulsa «Repasar fallos» tras fallar 3 países
- **THEN** empieza un reto del mismo tipo con esos 3 países

#### Scenario: Otra vez
- **WHEN** el alumno pulsa «Otra vez»
- **THEN** empieza una nueva sesión del mismo tipo y nivel

#### Scenario: Sin fallos
- **WHEN** la sesión no tuvo fallos
- **THEN** no aparece el botón «Repasar fallos»

### Requirement: Sin cabecera general en resultados
La pantalla de resultados SHALL mostrarse a ancho de lectura, centrada, sin la cabecera general.

#### Scenario: Ancho
- **WHEN** se muestran los resultados en un ordenador
- **THEN** el contenido está centrado en una columna estrecha
