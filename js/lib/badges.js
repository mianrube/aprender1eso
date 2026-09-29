import { COUNTRIES } from '../data/europa.js';
import { averageMastery, MAX_MASTERY } from './mastery.js';

const ALL_TYPES = ['tarjetas', 'test', 'emparejar', 'banderas', 'mapa', 'escribir'];
const LEVEL_BADGES = { 2: 'n2', 3: 'n3', 4: 'n4' };

export function isLevelUnlocked(level, m, threshold = 0.6) {
  if (level <= 1) return true;
  const prev = COUNTRIES.filter(c => c.level === level - 1).map(c => c.id);
  return averageMastery(prev, m) >= threshold;
}

// Insignias merecidas con este progreso. `session` es { misses, best } de la
// sesión recién terminada, o null si se evalúa fuera de una sesión.
export function earnedBadges({ m, types }, session, threshold = 0.6) {
  const out = [];
  if (session) {
    out.push('primera');
    if (session.misses === 0) out.push('pleno');
    if (session.best >= 5) out.push('imparable');
  }
  for (const [level, id] of Object.entries(LEVEL_BADGES)) {
    if (isLevelUnlocked(Number(level), m, threshold)) out.push(id);
  }
  if (ALL_TYPES.every(t => types.includes(t))) out.push('todoterreno');
  if (COUNTRIES.every(c => (m[c.id] || 0) >= MAX_MASTERY)) out.push('maestro');
  return out;
}

// Solo las que aún no estaban ganadas.
export function newBadges(save, session, threshold) {
  return earnedBadges(save, session, threshold).filter(id => !save.badges.includes(id));
}
