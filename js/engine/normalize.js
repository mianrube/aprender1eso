// Minúsculas, sin tildes y solo letras a–z (se eliminan también los espacios).
export function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
}

export function levenshtein(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

// Corrige la capital escrita: 'exact' | 'near' (un error de ortografía) | 'wrong'.
export function checkWritten(text, country) {
  const v = norm(text);
  const accepted = [country.capital, ...country.alt].map(norm);
  if (accepted.includes(v)) return 'exact';
  if (v && accepted.some(a => a.length > 3 && levenshtein(a, v) <= 1)) return 'near';
  return 'wrong';
}
