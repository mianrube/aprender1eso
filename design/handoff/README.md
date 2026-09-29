# Handoff: Rumbo — Portal de aprendizaje 1º ESO + módulo «Países y capitales de Europa»

## Overview
Rumbo es una app educativa para alumnado de **1º de ESO**, sin registro ni restricciones de acceso. Tiene dos partes:
1. **Portal**: la entrada a los módulos de aprendizaje (hoy solo hay uno activo). Muestra los puntos, la racha diaria y las insignias.
2. **Módulo «Países y capitales de Europa»**: 51 países repartidos en 4 niveles que se desbloquean uno tras otro, 6 tipos de reto, dominio por país y corrección inmediata más un resumen final.

La arquitectura debe permitir **añadir módulos nuevos** (otras materias o lecciones) reutilizando el mismo motor de retos, progreso e insignias.

## About the Design Files
Los archivos de este paquete son **referencias de diseño hechas en HTML**: prototipos que muestran el aspecto y el comportamiento que se buscan. No son código de producción para copiar tal cual. La tarea es **recrear estos diseños en el entorno del codebase de destino** con sus patrones y librerías. Si todavía no hay codebase, la recomendación es **Vite + React + TypeScript**: una SPA estática, sin backend, con el progreso guardado en `localStorage`.

- `Rumbo.dc.html`: prototipo completo (portal, módulo, reto y resultados). Se abre directamente en el navegador. La lógica está en el bloque `<script type="text/x-dc">`, dentro de `class Component`, y el marcado entre `<x-dc>…</x-dc>`. `support.js` es el runtime del prototipo y **no** hay que portarlo.
- `mapa-ue.html`: mapa interactivo de Europa (d3-geo + TopoJSON) que el prototipo carga en un `<iframe>` y con el que se comunica por `postMessage`. En producción conviene convertirlo en un componente nativo (`<EuropeMap>`) sin iframe.

## Fidelity
**Alta fidelidad (hifi).** Los colores, la tipografía, los radios, las sombras, los textos y las interacciones son finales. Hay que recrearlo con precisión.

---

## Design Tokens

### Colores
| Token | Hex | Uso |
|---|---|---|
| bg | `#FBF7EF` | Fondo de la app (crema cálido) |
| surface | `#FFFFFF` | Tarjetas |
| ink | `#1F2335` | Texto principal y trazo del mapa |
| muted | `#5B6072` | Texto secundario |
| subtle | `#8C8577` | Texto terciario y placeholders |
| line | `#EFE8DA` | Bordes de tarjeta y sombra sólida de tarjeta |
| line-strong | `#E6DECF` | Borde de opciones e inputs en reposo |
| track | `#EDE6D8` | Fondo de las barras de progreso |
| dashed | `#DDD3C0` | Borde discontinuo de «Próximamente» |
| blue / blue-dark | `#3B6EF5` / `#2A52C4` | Primario, Nivel 1, reto Test |
| yellow / yellow-dark | `#FFC43D` / `#D99A0B` | Puntos, CTA sobre azul, reto Tarjetas |
| green / green-dark | `#22B573` / `#178A56` | Acierto, progreso, reto Mapa |
| red / red-dark | `#F0555A` / `#C23A3F` | Error, Nivel 4, reto Escribe |
| purple / purple-dark | `#8B5CF6` / `#6A3FD1` | Nivel 2, reto Empareja |
| orange / orange-dark | `#FF8A3D` / `#D96A1F` | Racha, Nivel 3, reto Banderas |
| ok-bg / ok-ink | `#E2F6EA` / `#146B43` | Panel de acierto |
| bad-bg / bad-ink | `#FDE7E7` / `#A8282D` | Panel de error |
| select-bg | `#E8EEFF` | Selección en Empareja |
| points chip | bg `#FFF6DB`, borde `#FFE08A`, texto `#8A5E00` | |
| streak chip | bg `#FFF1E6`, borde `#FFD2B0`, texto `#A34C12` | |
| sea / land-context | `#CFE7F5` / `#EEE9DE` | Mapa: mar y países fuera de la lista |

**Escala de dominio (0–5)**, usada en el relleno del mapa: `#FFFFFF`, `#FFE9A8`, `#FFD466`, `#BDE8B0`, `#7ED49A`, `#22B573`.
Segmentos de la barra por país: el segmento vacío es `#EDE6D8`. El segmento lleno es `#FFD466` con dominio 1–2, `#7ED49A` con 3–4 y `#22B573` con 5.

### Tipografía (Google Fonts)
- **Fredoka** (500/600/700): títulos, números y botones.
- **Nunito** (500–800): cuerpo e interfaz.
- H1 del portal: Fredoka 700, `clamp(34px, 6vw, 54px)`, line-height 1.05, letter-spacing −0.02em.
- H1 del módulo: Fredoka 700, `clamp(30px, 5vw, 44px)`.
- Palabra clave del reto (país o capital): Fredoka 700, `clamp(38px, 7vw, 56px)`, lh 1.05.
- H2 de sección: Fredoka 600, 22–24px.
- Título de tarjeta de reto: Fredoka 600, 22px. Nombre de nivel: Fredoka 600, 19px.
- Botones principales: Fredoka 700, 19–20px.
- Enunciado del reto: Nunito 700, 19px, `muted`.
- Texto de opción: Nunito 700, 20px. Input de Escribe: Nunito 700, 28px.
- Chips y etiquetas: Nunito 800, 12–14px.

### Radios
Chips `99px` · botones `18px` · opciones `20px` · tarjeta de reto `24px` · paneles de mapa y nivel `22–28px` · tarjeta hero `30px` · icono de reto `17px` · banderas pequeñas `4–5px`, grandes `12–16px`.

### Sombras («3D chunky», el sello visual)
Todas son sólidas, sin desenfoque, desplazadas hacia abajo con el color *dark* del propio elemento:
- Botón: `0 5px 0 <dark>`. Al pulsarlo (`:active`): `transform: translateY(3px)` y `box-shadow: 0 2px 0 <dark>`.
- Tarjeta hero: `0 8px 0 #2A52C4`. Tarjeta de reto: `0 6px 0 #EFE8DA`; al pulsar, `translateY(4px)` y sombra `0 2px`.
- Opción o input: `0 5px 0 <color de borde>`. Así la sombra cambia a verde o rojo cuando se corrige.

### Espaciado
Base de 4px. Valores habituales: 8, 10, 12, 14, 16, 20, 22, 24, 32, 44 px. El contenedor de página tiene `max-width: 1120px` y padding de 20px (en retos y resultados, `max-width` de 780 y 680 px).

---

## Screens / Views

### 1. Portal (home)
**Header sticky** (todas las pantallas menos reto y resultados): padding 16×20, `border-bottom: 2px solid #EFE8DA`.
- Izquierda: un logo cuadrado de 40×40 (radio 13, azul, sombra `0 4px 0 #2A52C4`, letra «R» en Fredoka 22 blanca), el texto «Rumbo» en Fredoka 700 26px y un chip «1º ESO» (fondo ink, texto blanco, Nunito 800 12px). Al hacer clic se va al portal.
- Derecha: dos chips.
  - **Racha**: círculo naranja de 26px con el número y el texto «días seguidos» (o «día seguido» si es 1).
  - **Puntos**: círculo amarillo de 26px con `inset 0 -3px 0 #D99A0B` y el texto «{n} pts».

**Contenido** (columna, gap 44, padding superior 40):
1. **Saludo**: H1 «¡Hola! ¿Qué aprendemos hoy?» y el párrafo «Elige una misión. Cada reto que superes suma puntos, y si practicas un poco cada día tu racha crece.» (19px, muted, max-width 640).
2. **Misiones** (H2) en fila flex-wrap con gap 20:
   - **Tarjeta del módulo** (`flex: 2 1 560px`, azul, radio 30). Dentro hay dos columnas que se apilan en móvil:
     - Texto (padding 32): chips «Geografía» (amarillo) y «51 países · 4 niveles · 6 retos» (blanco al 18 %); el título «Países y capitales de Europa» (Fredoka 700, `clamp(28px, 4vw, 36px)`); la barra «Tu dominio {x}%» (pista blanca al 22 %, relleno amarillo, 14px de alto); y el botón amarillo «¡Empezar!», que pasa a «Continuar» si el dominio es mayor que 0.
     - Mapa de dominio sin interacción (min-height 260, radio 22, borde blanco al 35 %).
   - **Tarjeta «Próximamente»** (`flex: 1 1 260px`, borde discontinuo de 3px `#DDD3C0`, radio 30): «Más misiones en camino» / «Pronto podrás practicar otras materias desde aquí.», en color subtle.
3. **Tus insignias**: H2 y el contador «{n} de 8». Rejilla `repeat(auto-fill, minmax(140px, 1fr))` con gap 14. Cada tarjeta es blanca con radio 22 y lleva un círculo de 64px con el glifo, el nombre (800, 15px) y la descripción (13px). Si la insignia no se ha ganado, el círculo va en `#EDE8DC`, el glifo en `#B7AE9C` y la tarjeta al 75 % de opacidad.

### 2. Módulo «Países y capitales de Europa»
- «← Volver al portal» (texto muted, 800 15px).
- Chip «Geografía», el H1 y a la derecha la barra «Dominio total» (relleno verde).
- **Fila** en flex-wrap:
  - **Mapa de dominio** (`flex: 1.3 1 420px`): tarjeta blanca con radio 28 y padding 12; mapa de altura `clamp(300px, 48vw, 460px)`. Al pasar el ratón por un país aparece un tooltip «País · Capital». Debajo va la leyenda: Sin empezar / Aprendiendo / Casi / Dominado.
  - **«1. Elige nivel»** (`flex: 1 1 300px`): 4 tarjetas-botón. Cada una lleva un cuadrado de 46px con el número de nivel en su color, el nombre, un estado a la derecha (el porcentaje o «Bloqueado»), la lista de países (13px muted) y una barra de 8px en el color del nivel. Si el nivel está seleccionado, borde y sombra de 3px en su color. Si está bloqueado, opacidad 0.55 y el texto «Consigue un 60% en el nivel N-1 para desbloquearlo.».
- **«2. Elige un reto · Nivel N»**: rejilla `minmax(230px, 1fr)` con 6 tarjetas. Cada una lleva un icono de 54px en su color con glifo, la etiqueta de dificultad arriba a la derecha (12px), el nombre y la descripción. Al pulsar la tarjeta empieza el reto con el nivel elegido.
- **«Tu dominio país a país»**: rejilla `minmax(240px, 1fr)` con 51 filas. Cada fila lleva la bandera (38×26), el nombre (800), la capital a la derecha y 5 segmentos de 6px.

### 3. Reto (pantalla de juego)
- **Barra superior sticky**: botón ✕ de 44×44 (vuelve al módulo), la barra de progreso de 16px (relleno verde, `transition: width .4s`), el chip «racha x{n}» si la racha es de 2 o más (naranja) y el chip «+{puntos de la sesión}».
- Chips: el tipo de reto (en su color) y «Nivel N» o «Repaso de fallos».
- Contenido centrado (max-width 780, padding inferior 180 para dejar sitio al panel de feedback).

**Tipos de reto** (el orden de las tarjetas es el que se ve abajo):
| id | Nombre | Glifo | Color | Etiqueta | Descripción |
|---|---|---|---|---|---|
| tarjetas | Tarjetas | ↻ | yellow (glifo en ink) | Para empezar | Mira el país, piensa la capital y dale la vuelta a la tarjeta. |
| test | Test | ? | blue | Fácil | Cuatro respuestas y solo una es la buena. |
| emparejar | Empareja | ↔ | purple | Fácil | Une cada país con su capital. |
| banderas | Banderas | ▰ | orange | Medio | ¿De qué país es esta bandera? |
| mapa | Mapa | ◉ | green | Medio | Encuentra cada país en el mapa de Europa. |
| escribir | Escribe | Aa | red | Difícil | Teclea la capital tú solo. Cuidado con la ortografía. |

- **Test**: el 60 % de las preguntas son «¿Cuál es la capital de…» + país, con 4 capitales. El resto son «¿De qué país es capital…» + capital, con 4 países. Si la capital contiene el nombre del país (Luxemburgo, Mónaco, San Marino, Andorra, Vaticano), siempre se pregunta en el primer modo. Las opciones van en una rejilla `auto-fit minmax(260px, 1fr)` y cada una lleva un distintivo de 34px con la letra A–D.
- **Banderas**: se muestra una bandera grande (`min(340px, 100%)`, proporción 3:2, radio 16) con 4 países como opciones.
- **Escribe**: bandera de 84×56, enunciado y país; un input grande con el placeholder «Escribe aquí la capital»; el botón «Comprobar»; y la ayuda «No hace falta poner tildes. Pulsa Intro para comprobar.». El input recibe el foco solo.
- **Mapa**: el 70 % de las preguntas son «Toca en el mapa…» + país y el 30 % «Toca el país cuya capital es…» + capital. Mapa de altura `clamp(340px, 62vh, 600px)`. Al responder, el país correcto se pinta de verde y el tocado, si es erróneo, de rojo. Después se activa el tooltip con los nombres.
- **Tarjetas**: tarjeta de `min(460px, 100%)` en proporción 4:3 que gira con `rotateY(180deg)` en 0.55s, `cubic-bezier(.3,1.4,.5,1)`. El anverso es blanco, con la bandera de 120×80, el país y «¿Cuál es su capital? Toca para girar». El reverso es amarillo, con «Capital de {país}» y la capital en grande. Una vez girada aparecen «Aún no me la sé» (con contorno rojo) y «¡Me la sabía!» (verde). La autoevaluación pasa a la siguiente tarjeta sin mostrar el panel de feedback.
- **Empareja**: título «Une cada país con su capital», subtítulo «Toca un país y después su capital.». Dos columnas con 6 elementos cada una: a la izquierda país con bandera y a la derecha capitales desordenadas. Se puede tocar en cualquier orden. Un elemento seleccionado va con borde azul y fondo `#E8EEFF`. Una pareja correcta se queda verde al 60 % de opacidad y deja de responder. Una pareja errónea parpadea en rojo durante 650ms y se deselecciona. El país solo cuenta como acierto si se empareja sin fallar ninguna vez. Al completar todo, se pasa a resultados tras 600ms.

**Estados de las opciones tras responder**: la correcta va con fondo `#E2F6EA`, borde y sombra verdes y distintivo verde. La elegida errónea va con fondo `#FDE7E7`, borde rojo y distintivo rojo. Las demás, al 45 % de opacidad.

**Panel de feedback** (fijo abajo, con `safe-area-inset-bottom`): fondo ok-bg o bad-bg y `border-top: 3px` en verde o rojo.
- Título (Fredoka 700 26px), elegido al azar:
  - Si acierta: «¡Correcto!», «¡Eso es!», «¡Bien visto!», «¡Crack!» o «¡Perfecto!».
  - Si falla: «¡Casi!», «¡Uy! No era esa» o «A la próxima».
- Detalle (16px):
  - Si acierta: «+{p} puntos» y, con racha de 3 o más, « · ¡llevas N seguidas!».
  - Si falla, según el reto:
    - «La capital de X es Y.»
    - «Y es la capital de X.»
    - «Es la bandera de X.»
    - «Tocaste Z. X es el país en verde.»
    - «La capital de X es Y. Tú escribiste «…».»
    - Acierto por casi nada en Escribe: «Se escribe «Y». ¡Por muy poco!»
- El botón «Siguiente» va en verde o rojo según el resultado. **Intro** también sirve para comprobar y para pasar a la siguiente.

### 4. Resultados
Columna centrada (max-width 680):
- Chip «{Tipo} · {Nivel}».
- H1 según el porcentaje de aciertos: «¡Brutal!» con 90 % o más, «¡Muy bien!» con 60 % o más y «¡Sigue así!» por debajo. Fredoka 700, `clamp(40px, 8vw, 64px)`.
- «Has acertado X de Y».
- 3 tarjetas de datos en rejilla de 3 columnas: Aciertos (%) en tonos verdes, Puntos (+n) en amarillos y Mejor racha en naranjas.
- Si hay insignias nuevas, un panel azul «¡Insignia nueva!» con cada una: círculo amarillo de 40px y nombre.
- **«Para repasar»**: una fila por cada país fallado, sin repetir, con la bandera, «País → Capital» y «Tu respuesta: …» en rojo si la hubo.
- Botones: «Repasar fallos» (rojo, solo si hay fallos; lanza el mismo reto solo con esos países), «Otra vez» (azul) y «Elegir otro reto» (blanco con borde).

---

## Interactions & Behavior
- **Navegación**: Portal → Módulo → Reto → Resultados → (Repasar / Otra vez / Módulo). El botón ✕ del reto abandona la sesión sin guardarla como terminada; el dominio que ya se haya ganado se mantiene. Cada cambio de pantalla hace scroll arriba.
- **Selección de preguntas**: por defecto, 8 por sesión (configurable de 4 a 12), sacadas del nivel elegido con peso aleatorio `random() * (6 - dominio)`. Así los países que menos se dominan salen más a menudo. Los distractores son 3 países cualquiera de los 51.
- **Normalización en Escribe**: se pasa a minúsculas, se quitan las tildes con NFD y se eliminan los caracteres que no sean a–z, incluidos los espacios. Se acepta la capital oficial y sus alternativas. Si la distancia de Levenshtein es 1 o menos y la palabra tiene más de 3 letras, cuenta como acierto con aviso de ortografía.
- **Puntos**: 10 por acierto (5 en Tarjetas) y +5 extra si la racha dentro de la sesión es de 3 o más.
- **Dominio por país**: va de 0 a 5; +1 por acierto y −1 por fallo, sin salirse de ese rango.
- **Desbloqueo de niveles**: el nivel N se abre cuando el dominio medio del nivel N−1 llega al **60 %** (configurable). El dominio medio se calcula como Σ dominio / (nº de países × 5).
- **Racha diaria**: se actualiza al terminar una sesión. Si el último día jugado fue ayer, suma 1; si fue hoy, se queda igual; en cualquier otro caso vuelve a 1. Si el último día no es ni hoy ni ayer, se muestra 0.
- **Insignias**:
  | id | Nombre | Glifo | Condición |
  |---|---|---|---|
  | primera | Primera misión | 1 | Completar una sesión |
  | pleno | Pleno | 100 | Terminar una sesión sin fallos |
  | imparable | Imparable | x5 | 5 aciertos seguidos |
  | n2 | Nivel 2 | N2 | Desbloquear el nivel 2 |
  | n3 | Nivel 3 | N3 | Desbloquear el nivel 3 |
  | n4 | Nivel 4 | N4 | Desbloquear el nivel 4 |
  | todoterreno | Todoterreno | 6 | Jugar los 6 tipos de reto |
  | maestro | Maestro de Europa | 51 | Dominio 5 en los 51 países |
- **Responsive**: todo se basa en flex-wrap y rejillas auto-fill. No hay anchos fijos y los tamaños de objetivo táctil son de 44px o más. Tiene que funcionar en móvil, tablet y ordenador.

## State Management
```ts
type Save = {            // localStorage key: "rumbo-ue-v1"
  points: number; streak: number; lastDay: string | null; // "YYYY-M-D"
  m: Record<CountryId, 0|1|2|3|4|5>;   // dominio
  badges: BadgeId[]; types: ChallengeType[];
};
type Session = {
  type: ChallengeType; level: 1|2|3|4; ids?: CountryId[];   // ids = repaso de fallos
  items: Question[]; i: number; answered: boolean; ok: boolean|null;
  picked?: CountryId; input: string; flipped: boolean; marks: Record<CountryId,'ok'|'bad'>;
  results: {id: CountryId; ok: boolean; given: string|null}[];
  combo: number; best: number; earned: number; fb?: {ok:boolean; title:string; detail:string};
  match?: {left: CountryId[]; right: CountryId[]; done: Record<id,true>; errs: Record<id,true>; selL?: id; selR?: id; wrong?: {l,r}};
};
UI: screen: 'home'|'module'|'play'|'results'; selectedLevel.
```
No hay backend. Toda la persistencia es local. Para escalar a varios módulos, la recomendación es una definición declarativa de cada módulo: `{id, title, subject, items[], levels[], challengeTypes[]}`. El motor de retos debe ser genérico sobre pares pregunta–respuesta, con campos opcionales de imagen (bandera) y de geometría (mapa).

## Datos: 51 países (orden y niveles)
Formato: `iso2 · País · Capital · [otras formas que se aceptan]`.

**Nivel 1 · Europa occidental** (azul)
es España · Madrid; pt Portugal · Lisboa; fr Francia · París; gb Reino Unido · Londres [london]; ie Irlanda · Dublín; is Islandia · Reikiavik [reykjavik, reikiavic]; be Bélgica · Bruselas; nl Países Bajos · Ámsterdam; lu Luxemburgo · Luxemburgo; de Alemania · Berlín; ch Suiza · Berna [bern]; at Austria · Viena; it Italia · Roma.

**Nivel 2 · Norte y este** (morado)
no Noruega · Oslo; se Suecia · Estocolmo; fi Finlandia · Helsinki; dk Dinamarca · Copenhague; ee Estonia · Tallin [tallinn]; lv Letonia · Riga; lt Lituania · Vilna [vilnius]; pl Polonia · Varsovia [warszawa]; cz Chequia · Praga; sk Eslovaquia · Bratislava; hu Hungría · Budapest; by Bielorrusia · Minsk; ua Ucrania · Kiev [kyiv, kiiv]; ru Rusia · Moscú.

**Nivel 3 · Sur y Balcanes** (naranja)
gr Grecia · Atenas; cy Chipre · Nicosia; mt Malta · La Valeta [valeta, valletta]; al Albania · Tirana; mk Macedonia del Norte · Skopie [skopje, escopie]; rs Serbia · Belgrado; me Montenegro · Podgorica; ba Bosnia y Herzegovina · Sarajevo; hr Croacia · Zagreb; si Eslovenia · Liubliana [ljubljana]; xk Kosovo · Pristina [prishtina]; bg Bulgaria · Sofía; ro Rumanía · Bucarest; md Moldavia · Chisináu [kishinev]; tr Turquía · Ankara.

**Nivel 4 · Microestados y Cáucaso** (rojo)
ad Andorra · Andorra la Vieja [andorralavella]; mc Mónaco · Mónaco; sm San Marino · San Marino; va Ciudad del Vaticano · Ciudad del Vaticano [vaticano]; li Liechtenstein · Vaduz; ge Georgia · Tiflis [tbilisi]; am Armenia · Ereván [erevan, yerevan]; az Azerbaiyán · Bakú; kz Kazajistán · Astaná.

(La lista la dio la profesora o el profesor. En el original Georgia aparecía dos veces y se ha dejado una sola.)

## Mapa
- **Geometría**: `https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json` (Natural Earth, dominio público) con `topojson.feature(topo, topo.objects.countries)`. En producción es mejor incluir el JSON en el propio bundle y, si se quieren costas más finas, usar `countries-50m.json`.
- **Proyección**: `d3.geoAzimuthalEqualArea().rotate([-20,-54]).clipAngle(70).fitExtent([[14,14],[786,746]], MultiPoint[[-24,64],[-10,36],[44,36],[62,48],[32,71],[-8,56]])`, sobre un viewBox de 800×760 con `preserveAspectRatio="xMidYMid meet"`.
- **Relación con los ids**: se usa el código numérico ISO 3166 (tabla `NUM` en `mapa-ue.html`). Si no está, se recurre a `properties.name` para Kosovo, Norway, N. Cyprus (que se pinta como Chipre), Macedonia, etc.
- **Microestados** (Malta, Luxemburgo, Andorra, Liechtenstein, Mónaco, San Marino, Vaticano): se dibujan como círculos de r=5.5 en sus coordenadas, para que se puedan tocar.
- **Estilo**: países de la lista con trazo ink de 0.9px (2.2px si están marcados), `stroke-linejoin: round`, `transition: fill .25s` y `filter: brightness(.9)` al pasar el ratón si el mapa es interactivo. Los demás países van en `#EEE9DE` con trazo blanco y el mar en `#CFE7F5`. Tooltip: fondo ink, texto blanco, Nunito 800 13px, radio 10.
- **API del componente**: props `fills`, `names`, `marks`, `interactive`, `showNames` y un evento `onCountryClick(iso)`.

## Assets
- Banderas: `https://flagcdn.com/w320/{iso2}.png` (Kosovo = `xk`). Se recomienda descargarlas o empaquetarlas como SVG (por ejemplo, con el paquete `flag-icons`) para que funcionen sin conexión.
- Fuentes: Fredoka y Nunito, de Google Fonts.
- No hay iconos ni ilustraciones. Los glifos de los retos son caracteres Unicode.

## Parámetros configurables (Tweaks del prototipo)
- `questionsPerRound`: por defecto 8, de 4 a 12.
- `unlockThreshold`: por defecto 60 %.
- `showCapitals`: por defecto true. Si es false, la lista de dominio oculta la capital («???») hasta que el país llega a dominio 3.

## Files
- `Rumbo.dc.html`: prototipo completo (UI y lógica).
- `mapa-ue.html`: mapa de Europa en d3.
- `support.js`: runtime del prototipo, necesario solo para abrir `Rumbo.dc.html` en local. No hay que portarlo.

## Sugerencia de arranque en Claude Code
> «Lee `design_handoff_rumbo/README.md` y abre `Rumbo.dc.html` como referencia. Crea un proyecto Vite + React + TS que reproduzca las 4 pantallas con los tokens indicados, con un motor de retos genérico (`src/engine`), módulos declarativos (`src/modules/europa.ts`), persistencia en localStorage y un componente `<EuropeMap>` hecho con d3-geo sin iframe.»
