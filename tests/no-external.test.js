import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// Ficheros de la app que se publican: index.html, css/ y js/ (vendor/ es de terceros).
function appFiles() {
  const out = [];
  const walk = dir => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (['.html', '.css', '.js'].includes(extname(p))) out.push(p);
    }
  };
  if (existsSync(join(root, 'index.html'))) out.push(join(root, 'index.html'));
  for (const d of ['css', 'js']) if (existsSync(join(root, d))) walk(join(root, d));
  return out;
}

// Espacios de nombres XML/SVG: identifican, no descargan nada.
const ALLOWED = /^https?:\/\/www\.w3\.org\//;

export function findExternalUrls(text) {
  return (text.match(/https?:\/\/[^\s"'`)<>]+/g) || []).filter(u => !ALLOWED.test(u));
}

export function findAbsolutePaths(text) {
  return text.match(/(?:src|href)\s*=\s*["']\/(?!\/)|url\(\s*["']?\/(?!\/)/g) || [];
}

test('el detector encuentra una URL de CDN', () => {
  assert.deepEqual(findExternalUrls('<script src="https://cdn.example.com/x.js"></script>'), ['https://cdn.example.com/x.js']);
  assert.deepEqual(findExternalUrls('<svg xmlns="http://www.w3.org/2000/svg">'), []);
});

test('el detector encuentra rutas absolutas', () => {
  assert.equal(findAbsolutePaths('<link href="/css/a.css">').length, 1);
  assert.equal(findAbsolutePaths('a { background: url(/img/x.png) }').length, 1);
  assert.equal(findAbsolutePaths('<link href="./css/a.css">').length, 0);
});

test('la app no referencia orígenes externos', () => {
  for (const f of appFiles()) {
    assert.deepEqual(findExternalUrls(readFileSync(f, 'utf8')), [], f);
  }
});

test('la app usa solo rutas relativas', () => {
  for (const f of appFiles()) {
    assert.deepEqual(findAbsolutePaths(readFileSync(f, 'utf8')), [], f);
  }
});
