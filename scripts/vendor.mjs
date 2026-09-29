// Regenera vendor/ a partir de npm. Solo uso de desarrollo: el resultado se
// commitea y el despliegue nunca ejecuta este script.
//   node scripts/vendor.mjs
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COUNTRIES } from '../js/data/europa.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'vendor');

const VERSIONS = {
  'd3-geo': '3.1.1',
  'topojson-client': '3.1.0',
  'world-atlas': '2.0.2',
  'flag-icons': '7.5.0',
  '@fontsource/fredoka': '5.3.0',
  '@fontsource/nunito': '5.3.0',
  esbuild: '0.28.2',
};

const tmp = mkdtempSync(join(tmpdir(), 'rumbo-vendor-'));
const shell = process.platform === 'win32';
const run = (cmd, args) => execFileSync(cmd, args, { cwd: tmp, stdio: 'inherit', shell });
const nm = (...p) => join(tmp, 'node_modules', ...p);
const put = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
};

// Copia el fichero de licencia del paquete, sea cual sea su nombre.
const license = (pkg, to) => {
  const f = readdirSync(nm(pkg)).find(n => /^licen[cs]e/i.test(n));
  if (!f) throw new Error(`Sin licencia en ${pkg}`);
  put(nm(pkg, f), to);
};

try {
  writeFileSync(join(tmp, 'package.json'), JSON.stringify({ private: true }));
  run('npm', ['install', '--no-audit', '--no-fund', ...Object.entries(VERSIONS).map(([n, v]) => `${n}@${v}`)]);

  // Librerías: un único ESM autocontenido por librería (d3-geo arrastra d3-array).
  const bundle = (pkg, file) => {
    writeFileSync(join(tmp, `${file}.entry.js`), `export * from '${pkg}';\n`);
    run('npx', ['esbuild', `${file}.entry.js`, '--bundle', '--format=esm', '--minify', `--outfile=${join(out, pkg, `${file}.js`)}`, '--legal-comments=none']);
    license(pkg, join(out, pkg, 'LICENSE'));
  };
  bundle('d3-geo', 'd3-geo');
  bundle('topojson-client', 'topojson-client');

  // Geometría del mapa (Natural Earth, dominio público).
  put(nm('world-atlas', 'countries-110m.json'), join(out, 'world-atlas', 'countries-110m.json'));
  license('world-atlas', join(out, 'world-atlas', 'LICENSE'));

  // Banderas de los 51 países.
  for (const c of COUNTRIES) {
    const src = nm('flag-icons', 'flags', '4x3', `${c.id}.svg`);
    if (!existsSync(src)) throw new Error(`Falta la bandera de ${c.id}`);
    put(src, join(out, 'flags', `${c.id}.svg`));
  }
  license('flag-icons', join(out, 'flags', 'LICENSE'));

  // Fuentes (subconjunto latino).
  for (const w of [500, 600, 700]) {
    put(nm('@fontsource', 'fredoka', 'files', `fredoka-latin-${w}-normal.woff2`), join(out, 'fonts', `fredoka-${w}.woff2`));
  }
  for (const w of [500, 600, 700, 800]) {
    put(nm('@fontsource', 'nunito', 'files', `nunito-latin-${w}-normal.woff2`), join(out, 'fonts', `nunito-${w}.woff2`));
  }
  license('@fontsource/fredoka', join(out, 'fonts', 'LICENSE-fredoka'));
  license('@fontsource/nunito', join(out, 'fonts', 'LICENSE-nunito'));

  const versions = JSON.stringify(VERSIONS, null, 2) + '\n';
  writeFileSync(join(out, 'VERSIONS.json'), versions);
  console.log('vendor/ regenerado');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
