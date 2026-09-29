import { pickWeighted } from './rng.js';
import { MAX_MASTERY } from '../lib/mastery.js';

// Elige n países del pool. Los menos dominados tienen más probabilidad: peso (6 - dominio).
export function selectCountries(pool, m, n, rng = Math.random) {
  const count = Math.min(n, pool.length);
  return pickWeighted(pool, c => MAX_MASTERY + 1 - (m[c.id] || 0), count, rng);
}
