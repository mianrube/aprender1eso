const collator = new Intl.Collator('es', { sensitivity: 'base' });

// Nombre sin artículo inicial: «El Vaticano» se ordena como «Vaticano».
const sortKey = name => name.replace(/^(el|la|los|las)\s+/i, '');

export function sortByName(countries) {
  return countries.slice().sort((a, b) => collator.compare(sortKey(a.name), sortKey(b.name)));
}
