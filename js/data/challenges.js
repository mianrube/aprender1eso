// Catálogo de tipos de reto (orden de las tarjetas del módulo). `color` es un nombre de token CSS.
export const TYPES = [
  { id: 'tarjetas', name: 'Tarjetas', glyph: '↻', color: 'yellow', ink: 'var(--ink)', tag: 'Para empezar', desc: 'Mira el país, piensa la capital y dale la vuelta a la tarjeta.' },
  { id: 'test', name: 'Test', glyph: '?', color: 'blue', ink: '#fff', tag: 'Fácil', desc: 'Cuatro respuestas y solo una es la buena.' },
  { id: 'emparejar', name: 'Empareja', glyph: '↔', color: 'purple', ink: '#fff', tag: 'Fácil', desc: 'Une cada país con su capital.' },
  { id: 'banderas', name: 'Banderas', glyph: '▰', color: 'orange', ink: '#fff', tag: 'Medio', desc: '¿De qué país es esta bandera?' },
  { id: 'mapa', name: 'Mapa', glyph: '◉', color: 'green', ink: '#fff', tag: 'Medio', desc: 'Encuentra cada país en el mapa de Europa.' },
  { id: 'escribir', name: 'Escribe', glyph: 'Aa', color: 'red', ink: '#fff', tag: 'Difícil', desc: 'Teclea la capital tú solo. Cuidado con la ortografía.' },
];

export const TYPE_BY_ID = Object.fromEntries(TYPES.map(t => [t.id, t]));
