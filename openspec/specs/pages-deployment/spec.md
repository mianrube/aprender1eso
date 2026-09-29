# pages-deployment Specification

## Purpose
Define el despliegue continuo de Rumbo: cada integración en `main` se prueba y se publica automáticamente en GitHub Pages.

## Requirements

### Requirement: Despliegue automático desde main
Un workflow de GitHub Actions SHALL publicar el sitio en GitHub Pages en cada push a `main`, y SHALL poder lanzarse manualmente.

#### Scenario: Push a main
- **WHEN** se hace push de un commit a `main` y las pruebas pasan
- **THEN** el sitio actualizado queda publicado en GitHub Pages

#### Scenario: Ejecución manual
- **WHEN** un mantenedor lanza el workflow manualmente
- **THEN** se ejecutan pruebas y despliegue igual que en un push

### Requirement: Pruebas como puerta previa
El workflow SHALL ejecutar la suite de pruebas de lógica pura (`node --test`) antes de desplegar, y SHALL NOT desplegar si alguna falla.

#### Scenario: Prueba fallida
- **WHEN** una prueba falla en un push a `main`
- **THEN** el despliegue no se ejecuta y el workflow queda en error

### Requirement: Publicación solo del sitio
El artefacto publicado SHALL contener únicamente los ficheros de la aplicación (`index.html`, `css/`, `js/`, `vendor/` y los recursos necesarios) y SHALL excluir `design/`, `openspec/`, `tests/` y ficheros de configuración.

#### Scenario: Contenido del artefacto
- **WHEN** se genera el artefacto de Pages
- **THEN** no incluye las carpetas `design/`, `openspec/` ni `tests/`

### Requirement: Sin paso de build
El workflow SHALL desplegar los ficheros tal cual, sin instalar dependencias npm ni compilar.

#### Scenario: Workflow sin instalación
- **WHEN** se ejecuta el workflow
- **THEN** no hay pasos de `npm install` ni de build

### Requirement: Permisos mínimos y concurrencia
El workflow SHALL solicitar solo los permisos necesarios para Pages (`contents: read`, `pages: write`, `id-token: write`) y SHALL serializar los despliegues para que uno nuevo no corra en paralelo con otro.

#### Scenario: Dos pushes seguidos
- **WHEN** se hacen dos pushes a `main` en poco tiempo
- **THEN** los despliegues no se ejecutan simultáneamente
