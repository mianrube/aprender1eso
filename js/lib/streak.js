// Los días se guardan como "YYYY-M-D" (sin ceros), en hora local.
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function yesterdayKey(now) {
  return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

// Racha resultante al terminar una sesión.
export function nextStreak({ streak, lastDay }, now = new Date()) {
  if (lastDay === dayKey(now)) return streak;
  if (lastDay === yesterdayKey(now)) return streak + 1;
  return 1;
}

// Racha que se muestra: caduca si no se jugó ni hoy ni ayer.
export function shownStreak({ streak, lastDay }, now = new Date()) {
  if (lastDay === dayKey(now) || lastDay === yesterdayKey(now)) return streak;
  return 0;
}
