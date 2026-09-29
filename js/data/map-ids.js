// Relación entre la geometría de world-atlas (110m) y los códigos iso2 del módulo.
// Tablas tomadas de design/handoff/mapa-ue.html.

// Código numérico ISO 3166 -> iso2.
export const NUM = {
  8: 'al', 20: 'ad', 31: 'az', 40: 'at', 51: 'am', 56: 'be', 70: 'ba', 100: 'bg', 112: 'by', 191: 'hr',
  196: 'cy', 203: 'cz', 208: 'dk', 233: 'ee', 246: 'fi', 250: 'fr', 268: 'ge', 276: 'de', 300: 'gr',
  336: 'va', 348: 'hu', 352: 'is', 372: 'ie', 380: 'it', 398: 'kz', 428: 'lv', 438: 'li', 440: 'lt',
  442: 'lu', 470: 'mt', 492: 'mc', 498: 'md', 499: 'me', 528: 'nl', 578: 'no', 616: 'pl', 620: 'pt',
  642: 'ro', 643: 'ru', 674: 'sm', 688: 'rs', 703: 'sk', 705: 'si', 724: 'es', 752: 'se', 756: 'ch',
  792: 'tr', 804: 'ua', 807: 'mk', 826: 'gb',
};

// Países que en la geometría no traen código numérico: se identifican por nombre.
export const BYNAME = {
  Kosovo: 'xk', Norway: 'no', France: 'fr', 'N. Cyprus': 'cy',
  Macedonia: 'mk', 'North Macedonia': 'mk', 'Bosnia and Herz.': 'ba', Montenegro: 'me', Serbia: 'rs',
};

// Microestados: se dibujan como círculos en [lon, lat] para que se puedan tocar.
export const DOTS = {
  mt: [14.45, 35.9], lu: [6.13, 49.75], ad: [1.52, 42.51], li: [9.55, 47.14],
  mc: [7.42, 43.74], sm: [12.45, 43.94], va: [12.45, 41.9],
};

// Si un país no aparece en la geometría, se dibuja también como círculo aquí.
export const FALLBACK = {
  xk: [20.9, 42.6], mk: [21.7, 41.6], me: [19.3, 42.8], ba: [17.8, 44.2], cy: [33.2, 35.0],
};

export function resolveIso(feat) {
  return NUM[+feat.id] || BYNAME[feat.properties && feat.properties.name];
}
