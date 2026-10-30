#!/usr/bin/env node
// Builds the folder Cloudflare Pages publishes, so the site serves its own
// pages and nothing else from the repo.
//
// WHY THIS EXISTS
// Publishing the repo root as-is would serve every committed file beside the
// pages: CLAUDE.md, the docs, the tools, the brand research, the workflow
// files. The repo is private; the site is not. So the deploy is an
// allowlist: the entries in SITE are copied into public/ and nothing else is,
// and public/ is what Pages publishes.
//
// WHY IT CANNOT DRIFT
// An allowlist on its own fails quietly the other way -- a new page or folder
// that nobody listed simply 404s. So every top-level entry in the repo must
// be in SITE or PRIVATE, and the build refuses to run if one is in neither.
// A new folder cannot leak and cannot go missing: it stops the build until
// somebody decides which it is. Anything added inside a listed folder (a new
// module under js/) needs nothing here.
//
// After copying, every link the published pages make -- href and src on every
// page, the manifest, the service worker's precache list, and the sitemap
// once there is one -- is checked against what was actually copied, so a site
// file left off the list fails here rather than as a broken page.
//
// Cloudflare Pages settings (Settings > Builds):
//   Build command:          node tools/build-site.js
//   Build output directory: public
//
// Usage: node tools/build-site.js
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

// The site's own host, used to tell its absolute links (og:image, canonical)
// from somebody else's. A placeholder until a domain is bought: change it
// here, and in the og:image and canonical URLs of the pages, when it is.
const HOST = 'osmwiz.com';

// Published. A folder brings everything inside it, minus SKIP.
const SITE = [
  'index.html', '404.html', 'js', 'css',
  'sw.js', 'manifest.json', 'robots.txt', '_headers', '_redirects',
  'og.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'icon-maskable-512.png'
];

// Published when present. The icons and the share card are drawn separately
// from the code and may land after it; a missing one is not a reason to
// refuse the build. If a page or the manifest points at one that is missing,
// the link check below says so, which is the failure that matters.
const OPTIONAL = ['og.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'icon-maskable-512.png'];

// Never published.
const PRIVATE = [
  'CLAUDE.md', 'README.md', 'CHANGELOG.md', 'VERSIONING.md',
  'docs', 'tools', 'tests.html',
  '.github', '.claude', '.gitignore'
];

// Inside a published folder but not part of the site: the unit tests sit
// beside the modules they test, and only tests.html loads them.
const SKIP = [/\.test\.js$/];

/* ---------- every top-level entry is one or the other ---------- */

function topLevelEntries() {
  try {
    // Committed files plus new ones not yet committed (but not ignored), so a
    // local run catches a new folder before it is ever pushed.
    const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return [...new Set(files.split('\0').filter(Boolean).map((f) => f.split('/')[0]))];
  } catch (e) {
    // No git (a bare export of the repo): fall back to the directory, leaving
    // out what .gitignore keeps out of the repo anyway.
    const ignored = new Set(['.git', 'node_modules', 'dist', 'public', 'package.json',
      'package-lock.json', 'Thumbs.db', 'desktop.ini', '.DS_Store']);
    return fs.readdirSync(ROOT).filter((n) => !ignored.has(n));
  }
}

function classify() {
  const faults = [];
  const both = SITE.filter((n) => PRIVATE.includes(n));
  both.forEach((n) => faults.push(`${n} is in both SITE and PRIVATE`));
  topLevelEntries().forEach((n) => {
    if (!SITE.includes(n) && !PRIVATE.includes(n)) {
      faults.push(`${n} is not marked as site or private. Add it to SITE or PRIVATE in tools/build-site.js`);
    }
  });
  SITE.forEach((n) => {
    if (!OPTIONAL.includes(n) && !fs.existsSync(path.join(ROOT, n))) {
      faults.push(`${n} is listed in SITE but does not exist`);
    }
  });
  return faults;
}

/* ---------- copy ---------- */

function copy() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT);
  let count = 0;
  SITE.forEach((entry) => {
    if (!fs.existsSync(path.join(ROOT, entry))) return;   // an OPTIONAL one, not drawn yet
    fs.cpSync(path.join(ROOT, entry), path.join(OUT, entry), {
      recursive: true,
      filter: (src) => {
        if (SKIP.some((re) => re.test(src))) return false;
        if (fs.statSync(src).isFile()) count++;
        return true;
      }
    });
  });
  return count;
}

/* ---------- every link lands on something that was copied ---------- */

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, out); else out.push(p);
  });
  return out;
}

// The paths _redirects answers for, which exist without a file behind them.
// None yet, and the file is allowed to hold nothing but comments.
function redirectSources() {
  const file = path.join(OUT, '_redirects');
  if (!fs.existsSync(file)) return new Set();
  return new Set(fs.readFileSync(file, 'utf8').split('\n')
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/)[0]));
}

// Pages serves about.html at /about and section/index.html at /section/, so
// a path is satisfied by the file itself, its .html, or its index.html.
function resolves(urlPath, redirects) {
  let p;
  try { p = decodeURIComponent(urlPath); } catch (e) { p = urlPath; }
  if (redirects.has(p)) return true;
  const rel = p.replace(/^\/+/, '');
  const candidates = p.endsWith('/')
    ? [rel + 'index.html']
    : [rel, rel + '.html', rel + '/index.html'];
  return candidates.some((c) => {
    const f = path.join(OUT, c);
    return fs.existsSync(f) && fs.statSync(f).isFile();
  });
}

// Returns the site path a reference points at, or null when it points off
// the site (another host, a data: URI, a mailto: link, a bare #fragment).
function sitePath(ref, fromPath) {
  ref = ref.trim();
  if (!ref || ref.startsWith('#') || /^(data|mailto|tel|javascript):/i.test(ref)) return null;
  let u;
  try { u = new URL(ref, 'https://' + HOST + fromPath); } catch (e) { return null; }
  if (u.hostname !== HOST && u.hostname !== 'www.' + HOST) return null;
  return u.pathname;
}

function checkLinks() {
  const redirects = redirectSources();
  const missing = new Map();
  const faults = [];
  const note = (target, from) => {
    if (!missing.has(target)) missing.set(target, from);
  };
  const check = (ref, fromPath, from) => {
    const p = sitePath(ref, fromPath);
    if (p !== null && !resolves(p, redirects)) note(p, from);
  };
  const ownUrl = new RegExp('\\scontent\\s*=\\s*"(https:\\/\\/(?:www\\.)?' +
    HOST.replace(/\./g, '\\.') + '[^"]*)"', 'g');

  const files = walk(OUT, []);
  files.filter((f) => f.endsWith('.html')).forEach((f) => {
    const rel = path.relative(OUT, f).split(path.sep).join('/');
    const html = fs.readFileSync(f, 'utf8');
    // A page served at any depth (404.html is) carries <base href="/"> so its
    // relative links work wherever it is shown; they resolve against that.
    const base = html.match(/<base\s+href\s*=\s*"([^"]*)"/);
    const fromPath = base ? new URL(base[1], 'https://' + HOST + '/' + rel).pathname : '/' + rel;
    const links = html.replace(/<base\s[^>]*>/g, '');
    for (const m of links.matchAll(/\s(?:href|src)\s*=\s*"([^"]*)"/g)) check(m[1], fromPath, rel);
    // Share images and canonical addresses name the site by its full URL.
    for (const m of html.matchAll(ownUrl)) check(m[1], fromPath, rel);
  });

  // No sitemap yet. When one is added it must be listed in SITE, and from
  // then on every address in it is checked like a link.
  const sitemapFile = path.join(OUT, 'sitemap.xml');
  if (fs.existsSync(sitemapFile)) {
    const sitemap = fs.readFileSync(sitemapFile, 'utf8');
    for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) check(m[1], '/', 'sitemap.xml');
  }

  const manifestFile = path.join(OUT, 'manifest.json');
  if (fs.existsSync(manifestFile)) {
    let manifest = null;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    } catch (e) {
      faults.push('manifest.json is not valid JSON: ' + e.message);
    }
    if (manifest) {
      [manifest.start_url, ...(manifest.icons || []).map((i) => i.src),
        ...(manifest.shortcuts || []).map((s) => s.url)]
        .filter(Boolean).forEach((ref) => check(ref, '/', 'manifest.json'));
    }
  }

  const swFile = path.join(OUT, 'sw.js');
  if (fs.existsSync(swFile)) {
    const precache = fs.readFileSync(swFile, 'utf8').match(/var PRECACHE = \[([\s\S]*?)\];/);
    if (precache) {
      for (const m of precache[1].matchAll(/'([^']+)'/g)) check(m[1], '/', 'sw.js');
    } else {
      faults.push('sw.js has no PRECACHE list. Run: node tools/stamp-assets.js');
    }
  }

  return faults.concat([...missing].map(([target, from]) =>
    `${target} (linked from ${from}) was not published`));
}

/* ---------- run ---------- */

const faults = classify();
if (faults.length) {
  console.error('build-site: refusing to build.\n  ' + faults.join('\n  '));
  process.exit(1);
}
const copied = copy();
const broken = checkLinks();
if (broken.length) {
  console.error(`build-site: ${broken.length} problem(s) with what was published.\n  ` +
    broken.slice(0, 50).join('\n  ') + (broken.length > 50 ? `\n  ...and ${broken.length - 50} more` : ''));
  process.exit(1);
}
console.log(`build-site: ${copied} files into public/, every link resolves ` +
  `(${SITE.length} site entries, ${PRIVATE.length} private)`);
