// rng determinista (mulberry32) para los tests.
export function seeded(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// rng que devuelve una secuencia fija y luego se repite el último valor.
export function fixed(...values) {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

export const emptySave = () => ({ points: 0, streak: 0, lastDay: null, m: {}, badges: [], types: [] });
