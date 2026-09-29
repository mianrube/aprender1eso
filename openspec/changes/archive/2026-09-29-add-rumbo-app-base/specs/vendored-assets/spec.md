## Purpose

Garantiza que Rumbo no dependa de servicios de terceros en tiempo de ejecución: librerías, fuentes, geometría del mapa y banderas viajan dentro del repositorio.

## ADDED Requirements

### Requirement: Sin dependencias externas en ejecución
La aplicación SHALL cargar todos sus scripts, hojas de estilo, fuentes, datos e imágenes desde el propio sitio. Ningún recurso SHALL solicitarse a un CDN u otro origen.

#### Scenario: Sin conexión a terceros
- **WHEN** se carga el portal con el acceso a dominios externos bloqueado
- **THEN** la app se ve y funciona igual, con sus fuentes y sin peticiones a otros orígenes

### Requirement: Librerías del mapa vendorizadas
El repositorio SHALL incluir las librerías de proyección y decodificación del mapa (d3-geo y topojson-client) y la geometría de países (world-atlas, 110m) en `vendor/`, con su licencia.

#### Scenario: Recursos presentes
- **WHEN** se inspecciona `vendor/`
- **THEN** existen las librerías, los datos del mapa y los ficheros de licencia correspondientes

### Requirement: Fuentes locales
Las tipografías Fredoka (500/600/700) y Nunito (500–800) SHALL servirse desde el repositorio con `font-display: swap`.

#### Scenario: Fuente disponible
- **WHEN** se muestra un título del portal
- **THEN** se renderiza con Fredoka cargada localmente

### Requirement: Banderas de los 51 países
El repositorio SHALL incluir una bandera SVG para cada uno de los 51 países del módulo (incluido Kosovo), nombradas por su código iso2 en minúsculas.

#### Scenario: Cobertura completa
- **WHEN** se comprueba la lista de 51 códigos iso2 del módulo
- **THEN** existe un fichero de bandera para cada uno

### Requirement: Comprobación automática de recursos
Las pruebas SHALL fallar si falta alguna bandera o si algún fichero HTML, CSS o JS de la app contiene una URL `http(s)://` a un origen externo.

#### Scenario: Referencia externa introducida
- **WHEN** un fichero de la app referencia `https://cdn.example.com/x.js`
- **THEN** la suite de pruebas falla
