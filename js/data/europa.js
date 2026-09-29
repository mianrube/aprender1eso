// Módulo «Países y capitales de Europa». Lista oficial: la de la libreta de clase
// (52 filas con Georgia repetida = 51 países); nombres y capitales tal como ahí.
// Los niveles vienen del handoff de diseño. Formato de cada país:
// [iso2, nombre, capital, formas alternativas aceptadas]
export const LEVELS = [
  { n: 1, name: 'Europa occidental', color: 'blue' },
  { n: 2, name: 'Norte y este', color: 'purple' },
  { n: 3, name: 'Sur y Balcanes', color: 'orange' },
  { n: 4, name: 'Microestados y Cáucaso', color: 'red' },
];

const RAW = [
  [1, [
    ['es', 'España', 'Madrid'],
    ['pt', 'Portugal', 'Lisboa'],
    ['fr', 'Francia', 'París'],
    ['gb', 'Reino Unido', 'Londres', ['london']],
    ['ie', 'Irlanda', 'Dublín'],
    ['is', 'Islandia', 'Reikiavik', ['reykjavik', 'reikiavic']],
    ['be', 'Bélgica', 'Bruselas'],
    ['nl', 'Países Bajos', 'Ámsterdam'],
    ['lu', 'Luxemburgo', 'Luxemburgo'],
    ['de', 'Alemania', 'Berlín'],
    ['ch', 'Suiza', 'Berna', ['bern']],
    ['at', 'Austria', 'Viena'],
    ['it', 'Italia', 'Roma'],
  ]],
  [2, [
    ['no', 'Noruega', 'Oslo'],
    ['se', 'Suecia', 'Estocolmo'],
    ['fi', 'Finlandia', 'Helsinki'],
    ['dk', 'Dinamarca', 'Copenhague'],
    ['ee', 'Estonia', 'Tallin', ['tallinn']],
    ['lv', 'Letonia', 'Riga'],
    ['lt', 'Lituania', 'Vilna', ['vilnius']],
    ['pl', 'Polonia', 'Varsovia', ['warszawa']],
    ['cz', 'Chequia', 'Praga'],
    ['sk', 'Eslovaquia', 'Bratislava'],
    ['hu', 'Hungría', 'Budapest'],
    ['by', 'Bielorrusia', 'Minsk'],
    ['ua', 'Ucrania', 'Kiev', ['kyiv', 'kiiv']],
    ['ru', 'Rusia', 'Moscú'],
  ]],
  [3, [
    ['gr', 'Grecia', 'Atenas'],
    ['cy', 'Chipre', 'Nicosia'],
    ['mt', 'Malta', 'La Valeta', ['valeta', 'valletta']],
    ['al', 'Albania', 'Tirana'],
    ['mk', 'Macedonia', 'Skopie', ['skopje', 'escopie']],
    ['rs', 'Serbia', 'Belgrado'],
    ['me', 'Montenegro', 'Podgorica'],
    ['ba', 'Bosnia y Herzegovina', 'Sarajevo'],
    ['hr', 'Croacia', 'Zagreb'],
    ['si', 'Eslovenia', 'Liubliana', ['ljubljana']],
    ['xk', 'Kosovo', 'Pristina', ['prishtina']],
    ['bg', 'Bulgaria', 'Sofía'],
    ['ro', 'Rumanía', 'Bucarest'],
    ['md', 'Moldavia', 'Chisináu', ['kishinev']],
    ['tr', 'Turquía', 'Ankara'],
  ]],
  [4, [
    ['ad', 'Andorra', 'Andorra la Vieja', ['andorralavella']],
    ['mc', 'Mónaco', 'Mónaco'],
    ['sm', 'San Marino', 'San Marino'],
    ['va', 'El Vaticano', 'Ciudad del Vaticano', ['vaticano']],
    ['li', 'Liechtenstein', 'Vaduz'],
    ['ge', 'Georgia', 'Tiflis', ['tbilisi']],
    ['am', 'Armenia', 'Ereván', ['erevan', 'yerevan']],
    ['az', 'Azerbaiyán', 'Bakú'],
    ['kz', 'Kazajistán', 'Astaná'],
  ]],
];

export const COUNTRIES = RAW.flatMap(([level, list]) =>
  list.map(([id, name, capital, alt = []]) => ({ id, name, capital, alt, level })),
);

export const MODULE = {
  id: 'europa',
  title: 'Países y capitales de Europa',
  subject: 'Geografía',
  levels: LEVELS,
  items: COUNTRIES,
};
