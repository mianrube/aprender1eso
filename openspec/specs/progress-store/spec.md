# progress-store Specification

## Purpose
Define cómo Rumbo guarda el progreso del alumno solo en el navegador, sin backend ni base de datos, y cómo calcula la racha diaria y el dominio.

## Requirements

### Requirement: Persistencia local
El progreso (puntos, racha, último día jugado, dominio por país, insignias y tipos de reto jugados) SHALL guardarse en `localStorage` bajo la clave `rumbo-ue-v1` y recuperarse al abrir la app. La app SHALL NOT enviar datos a ningún servidor.

#### Scenario: Recuperar progreso
- **WHEN** existe progreso guardado y el alumno reabre la app
- **THEN** puntos, racha e insignias coinciden con lo guardado

#### Scenario: Primera visita
- **WHEN** no hay nada guardado
- **THEN** se usa el progreso inicial: 0 puntos, racha 0, sin dominio ni insignias

### Requirement: Tolerancia a fallos de almacenamiento
Si `localStorage` no está disponible o falla al leer o escribir, la app SHALL seguir funcionando guardando el progreso en memoria durante la sesión. Datos guardados corruptos SHALL tratarse como progreso inicial.

#### Scenario: Almacenamiento bloqueado
- **WHEN** el navegador bloquea `localStorage`
- **THEN** la app se abre y el progreso se mantiene mientras la pestaña siga abierta

#### Scenario: JSON corrupto
- **WHEN** el valor guardado no es JSON válido
- **THEN** la app arranca con el progreso inicial sin lanzar errores

#### Scenario: Campos ausentes
- **WHEN** el valor guardado no incluye algún campo
- **THEN** ese campo toma su valor inicial

### Requirement: Borrado de progreso
El store SHALL poder eliminar todo el progreso, tanto guardado como en memoria.

#### Scenario: Reinicio
- **WHEN** se solicita borrar el progreso
- **THEN** la clave guardada se elimina y el estado vuelve al inicial

### Requirement: Racha diaria
La racha SHALL actualizarse al registrar una sesión terminada: +1 si el último día jugado fue ayer, sin cambio si fue hoy, y 1 en cualquier otro caso. Al mostrarla, si el último día jugado no es hoy ni ayer, SHALL mostrarse 0.

#### Scenario: Jugó ayer
- **WHEN** el último día jugado fue ayer con racha 3 y se termina una sesión hoy
- **THEN** la racha pasa a 4

#### Scenario: Jugó hoy
- **WHEN** ya se jugó hoy y se termina otra sesión
- **THEN** la racha no cambia

#### Scenario: Racha rota
- **WHEN** el último día jugado fue hace tres días y se termina una sesión hoy
- **THEN** la racha pasa a 1

#### Scenario: Visualización de racha caducada
- **WHEN** el último día jugado fue hace tres días y se abre el portal
- **THEN** se muestra racha 0

### Requirement: Dominio total
El dominio medio de un conjunto de países SHALL calcularse como suma de dominios / (número de países × 5), con dominio por país entre 0 y 5.

#### Scenario: Cálculo
- **WHEN** hay 4 países con dominios 5, 5, 0 y 0
- **THEN** el dominio medio es 50%
