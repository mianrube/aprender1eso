import { clampMastery } from '../lib/mastery.js';

export const POINTS_ANSWER = 10;
export const POINTS_CARD = 5;
export const COMBO_BONUS = 5;
export const COMBO_MIN = 3;

// Aplica una respuesta al progreso: dominio ±1 (acotado 0–5) y puntos.
// `combo` es la racha de aciertos de la sesión antes de esta respuesta.
export function applyAnswer(save, id, ok, base, combo) {
  const m = { ...save.m, [id]: clampMastery((save.m[id] || 0) + (ok ? 1 : -1)) };
  const nextCombo = ok ? combo + 1 : 0;
  const gained = ok ? base + (nextCombo >= COMBO_MIN ? COMBO_BONUS : 0) : 0;
  return { save: { ...save, m, points: save.points + gained }, combo: nextCombo, gained };
}
