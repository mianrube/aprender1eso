// Utilidades aleatorias. `rng` es una función () => [0, 1) inyectable para poder probar.
export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickOne(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

// Elige n elementos sin repetir; cada uno tiene la clave rng() * weight(item)
// y se quedan los de clave mayor. Después se mezclan.
export function pickWeighted(items, weight, n, rng = Math.random) {
  const keyed = items.map(item => ({ item, k: rng() * weight(item) }));
  keyed.sort((a, b) => b.k - a.k);
  return shuffle(keyed.slice(0, n).map(x => x.item), rng);
}
