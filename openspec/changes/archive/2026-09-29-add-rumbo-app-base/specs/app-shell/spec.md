## Purpose

Define la estructura estática de la aplicación Rumbo, su sistema visual y la navegación entre pantallas, de modo que funcione desde cualquier subruta de GitHub Pages sin servidor ni proceso de build.

## ADDED Requirements

### Requirement: Aplicación estática sin build
La aplicación SHALL ser un sitio estático formado solo por HTML, CSS y JavaScript (ES modules nativos) que funcione al servirse tal cual desde un servidor de ficheros, sin backend ni paso de compilación.

#### Scenario: Servida como ficheros estáticos
- **WHEN** el contenido del repositorio se sirve con un servidor de ficheros estáticos
- **THEN** el portal se muestra y es funcional sin ejecutar ningún comando de build

### Requirement: Rutas relativas
Todas las referencias a recursos y enlaces internos SHALL ser relativas, de forma que la app funcione tanto en la raíz de un dominio como bajo una subruta `/<repo>/`.

#### Scenario: Servida bajo una subruta
- **WHEN** la app se sirve desde `/aprender1eso/`
- **THEN** hojas de estilo, scripts, fuentes e imágenes se cargan sin errores 404

### Requirement: Router por hash
La aplicación SHALL navegar entre pantallas mediante el fragmento de la URL (`#/...`), sin depender de reescrituras del servidor. Una ruta desconocida SHALL llevar al portal.

#### Scenario: Recarga en una pantalla
- **WHEN** el usuario recarga la página con un hash de ruta válido
- **THEN** se muestra la misma pantalla

#### Scenario: Ruta desconocida
- **WHEN** el hash no corresponde a ninguna pantalla
- **THEN** se muestra el portal

#### Scenario: Botón atrás
- **WHEN** el usuario navega de una pantalla a otra y pulsa atrás en el navegador
- **THEN** vuelve a la pantalla anterior

### Requirement: Cambio de pantalla con scroll arriba
Cada cambio de pantalla SHALL dejar la vista al inicio de la página.

#### Scenario: Navegación desde una página larga
- **WHEN** el usuario cambia de pantalla estando desplazado hacia abajo
- **THEN** la nueva pantalla se muestra desde su parte superior

### Requirement: Sistema visual del diseño
La interfaz SHALL usar los tokens del handoff de diseño: paleta de colores, tipografías Fredoka (títulos, números, botones) y Nunito (cuerpo), radios y sombras sólidas desplazadas hacia abajo («3D chunky»), con contenedor de página de ancho máximo 1120px y objetivos táctiles de al menos 44px.

#### Scenario: Botón pulsado
- **WHEN** el usuario pulsa un botón principal
- **THEN** el botón se desplaza hacia abajo y su sombra se reduce, como indica el diseño

### Requirement: Adaptación a distintos tamaños
La interfaz SHALL adaptarse a móvil, tablet y ordenador sin scroll horizontal, usando disposiciones flexibles en lugar de anchos fijos.

#### Scenario: Pantalla estrecha
- **WHEN** el ancho de la ventana es de 360px
- **THEN** no aparece scroll horizontal y los elementos se apilan
