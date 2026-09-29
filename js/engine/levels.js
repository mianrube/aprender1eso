import { COUNTRIES } from '../data/europa.js';
import { averageMastery } from '../lib/mastery.js';
import { isLevelUnlocked } from '../lib/badges.js';
import { UNLOCK_THRESHOLD } from '../config.js';

// Nivel 0 = «Todos los países»: los 51 mezclados, siempre disponible.
export const LEVEL_ALL = 0;

export const countriesOfLevel = level => (level === LEVEL_ALL ? COUNTRIES : COUNTRIES.filter(c => c.level === level));
export const idsOfLevel = level => countriesOfLevel(level).map(c => c.id);

// Porcentaje de dominio (0–100, redondeado) de un nivel.
export function levelPct(level, m) {
  return Math.round(averageMastery(idsOfLevel(level), m) * 100);
}

// Porcentaje de dominio de los 51 países.
export function totalPct(m) {
  return Math.round(averageMastery(COUNTRIES.map(c => c.id), m) * 100);
}

export function isUnlocked(level, m, threshold = UNLOCK_THRESHOLD) {
  return level === LEVEL_ALL || isLevelUnlocked(level, m, threshold);
}
