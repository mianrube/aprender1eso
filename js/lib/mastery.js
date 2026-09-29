export const MAX_MASTERY = 5;

export function clampMastery(v) {
  return Math.max(0, Math.min(MAX_MASTERY, v));
}

// Dominio medio de una lista de ids, de 0 a 1: suma de dominios / (n × 5).
export function averageMastery(ids, m) {
  if (!ids.length) return 0;
  const sum = ids.reduce((acc, id) => acc + clampMastery(m[id] || 0), 0);
  return sum / (ids.length * MAX_MASTERY);
}
