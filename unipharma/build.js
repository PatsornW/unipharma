// build.js — Pre-compile JSX so iPad / mobile don't need babel-standalone.
// Runs on Vercel via `npm run build`. Bundles all .js + .jsx files into
// one minified app.bundle.js. Concatenated, with esbuild's JSX transform.

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// Diagnostic: print every path we're working with so a build failure on
// Vercel tells us exactly where things landed.
const HERE = __dirname;
const CWD = process.cwd();
console.log('[build] __dirname:', HERE);
console.log('[build] process.cwd():', CWD);

// Try to find the source directory by looking for config.js in a few
// candidate locations: where build.js lives, then cwd, then unipharma/
// inside cwd (if Vercel ran from repo root for some reason).
const candidates = [HERE, CWD, path.join(CWD, 'unipharma'), path.join(HERE, 'unipharma')];
let SRC = null;
for (const c of candidates) {
  const probe = path.join(c, 'config.js');
  console.log('[build] probe:', probe, fs.existsSync(probe) ? 'YES' : 'no');
  if (fs.existsSync(probe)) { SRC = c; break; }
}
if (!SRC) {
  console.error('[build] FAILED: could not locate the source directory containing config.js');
  console.error('[build] Listing __dirname contents:', fs.readdirSync(HERE).slice(0, 30));
  process.exit(1);
}
console.log('[build] using source dir:', SRC);

const OUT = path.join(SRC, 'app.bundle.js');

// MUST match the load order from index.html. Plain JS first (set up window
// globals + DB + UTILS), then JSX components, then app.jsx last.
const FILES = [
  'config.js', 'data.js', 'utils.js', 'db.js',
  'auth.jsx', 'components.jsx', 'Dashboard.jsx', 'Drugs.jsx', 'Orders.jsx',
  'CreatePO.jsx', 'PODocument.jsx', 'Suppliers.jsx', 'Comparison.jsx',
  'Stock.jsx', 'OutOfStock.jsx', 'Reports.jsx', 'Help.jsx', 'DataSync.jsx',
  'tweaks-panel.jsx', 'CategoryManager.jsx', 'app.jsx',
];

// One `const { ... } = React` at the very top — otherwise concatenation
// creates duplicate top-level `const` declarations and the bundle fails.
const banner = '// UNIPHARMA — bundled ' + new Date().toISOString() + '\n'
  + 'const { useState, useEffect, useMemo, useRef, useCallback } = React;\n';
const REACT_HOOKS_LINE = /^\s*const\s*\{[^}]*\}\s*=\s*React\s*;\s*$/gm;

const parts = [banner];
for (const f of FILES) {
  const p = path.join(SRC, f);
  if (!fs.existsSync(p)) {
    console.error('[build] Missing source file:', f, 'at', p);
    process.exit(1);
  }
  parts.push('\n/* ===== ' + f + ' ===== */\n');
  parts.push(fs.readFileSync(p, 'utf8').replace(REACT_HOOKS_LINE, ''));
}
const combined = parts.join('\n');

esbuild.transform(combined, {
  loader: 'jsx',
  jsx: 'transform',
  target: ['es2018', 'safari13'],
  minify: true,
  legalComments: 'none',
}).then(result => {
  fs.writeFileSync(OUT, result.code);
  const kb = (result.code.length / 1024).toFixed(1);
  console.log('[build] ✓ Bundled ' + FILES.length + ' files → ' + OUT + ' (' + kb + ' KB)');
}).catch(err => {
  console.error('[build] FAILED:', err);
  process.exit(1);
});
