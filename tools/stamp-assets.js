#!/usr/bin/env node
// Stamps every page's local asset URLs with the app version, so a browser
// holding an old copy of the app fetches the new one.
//
// Why a tool rather than a literal in index.html: the version lives in
// OSM.data.VERSION and nowhere else (see VERSIONING.md), and index.html
// cannot read it -- js/data.js is one of the very files being stamped. Writing
// it into the markup by hand would make a second source of truth that drifts
// silently, and the failure it causes (some visitors on old JS, new CSS) is
// among the hardest to reproduce, because it only ever happens to people who
// came back.
//
// Only css/ and js/ paths are touched. The Google Fonts stylesheet carries a
// query string of its own and is somebody else's URL.
//
// tests.html is deliberately left alone: it is a harness opened by hand, and
// a stale cache there is a reload, not a bug report.
//
// Every page is stamped, not just index.html, so a second page sharing the
// stylesheet (404.html already does) cannot serve a stale copy of it.
//
// It also writes the service worker's precache list, for the same reason it
// writes the stamps: this tool already knows every page and every asset URL,
// and a second hand-maintained copy of that list would drift. A drifted
// precache list is how an offline visitor gets new CSS against old JS.
//
// Usage:
//   node tools/stamp-assets.js           rewrite the pages and sw.js in place
//   node tools/stamp-assets.js --check   exit 1 if any stamp, or the precache
//                                        list, is missing or stale
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const check = process.argv.indexOf('--check') !== -1;
const version = require('./version')();

// Every page except the harness. Discovered rather than listed, so a new page
// is covered the moment it exists instead of the next time somebody remembers
// this file.
//
// Pages in a subfolder (a future section/index.html) are found by walking for
// index.html, outside the folders that hold source rather than pages. There
// are none yet; the walk is here so the first one is stamped and precached
// without anybody having to remember this file. public/ is the built copy of
// the site (tools/build-site.js), so it holds no pages of its own.
const SKIP = ['node_modules', 'dist', 'js', 'css', 'tools', 'docs', 'public'];
function subPages(rel) {
  const out = [];
  fs.readdirSync(path.join(ROOT, rel)).sort().forEach((d) => {
    const sub = path.join(rel, d);
    if (d[0] === '.' || (!rel && SKIP.indexOf(d) !== -1)) return;
    if (!fs.statSync(path.join(ROOT, sub)).isDirectory()) return;
    if (fs.existsSync(path.join(ROOT, sub, 'index.html'))) out.push(path.join(sub, 'index.html'));
    out.push(...subPages(sub));
  });
  return out;
}
const PAGES = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && f !== 'tests.html')
  .sort()
  .concat(subPages(''));

// Scoped to a src= or href= attribute so a path appearing anywhere else in the
// markup is left alone.
const ASSET = /((?:src|href)=")((?:\.\.\/)*(?:css|js)\/[^"?]+)(\?[^"]*)?(")/g;

// The social preview card, which is not a src or an href and is absolute --
// a crawler resolves og:image against nothing -- so the rule above never sees
// it. Matched on any host, so the placeholder domain can change without this
// file changing with it.
//
// It is a worse cache than the app's. A browser holding stale CSS reloads; a
// network that has cached this image keeps serving a card the site stopped
// using, in every link anybody shares, and there is no button anywhere that
// clears it. Versioned, every release hands them a URL nothing has seen.
const OG_IMAGE = /(content="https:\/\/[^"]*\/og\.png)(\?[^"]*)?(")/g;

const stale = [];
const written = [];
let count = 0;

PAGES.forEach((page) => {
  const file = path.join(ROOT, page);
  const before = fs.readFileSync(file, 'utf8');
  let pageCount = 0;

  const want = '?v=' + version;
  let after = before.replace(ASSET, (all, open, asset, query, close) => {
    pageCount++;
    if (query !== want) stale.push(page + ' → ' + asset + (query || ' (unstamped)'));
    return open + asset + want + close;
  });
  after = after.replace(OG_IMAGE, (all, url, query, close) => {
    pageCount++;
    if (query !== want) stale.push(page + ' → og.png' + (query || ' (unstamped)'));
    return url + want + close;
  });

  count += pageCount;
  if (!check && after !== before) {
    fs.writeFileSync(file, after);
    written.push(page + ' (' + pageCount + ')');
  }
});

if (!count) {
  console.error('stamp-assets: no local asset tags found in ' +
    (PAGES.length ? PAGES.join(', ') : 'any page (there are none)') +
    ' — have they moved?');
  process.exit(1);
}

// In --check mode a stale stamp is remembered rather than exited on, so the
// precache list below is checked on the same run. (FHC's copy of this tool
// exited here, which meant CI never once looked at its sw.js list.)
let failed = false;

if (check) {
  if (stale.length) {
    console.error('stamp-assets: ' + stale.length + ' of ' + count +
      ' asset tags are not stamped v' + version + ':');
    stale.forEach((f) => console.error('  ' + f));
    failed = true;
  } else {
    console.log('stamp-assets: all ' + count + ' asset tags across ' + PAGES.length +
      ' pages carry v' + version);
  }
} else if (written.length) {
  console.log('stamp-assets: stamped v' + version + ' — ' + written.join(', '));
} else {
  console.log('stamp-assets: already at v' + version + ' (' + count + ' tags, ' +
    PAGES.length + ' pages)');
}

/* ---------- the service worker's precache list ----------

   Built from the same walk as the stamps above, so the two cannot disagree.
   What goes in: every page at the URL it is actually served from, every
   stamped asset, and the handful of unstamped files the app needs to look
   like itself. What stays out: the fonts, which are somebody else's URLs and
   are handled at runtime in sw.js. */

function servedAs(page) {
  page = page.split(path.sep).join('/');
  if (page === 'index.html') return '/';
  // Cloudflare Pages serves section/index.html at /section/, and that is the
  // URL a navigation asks for, so it is the one to cache under.
  if (page.endsWith('/index.html')) return '/' + page.slice(0, -'index.html'.length);
  return '/' + page;
}

// Each one only if it exists: the icons and the share card arrive separately
// from the code, and a precache entry for a missing file would fail the whole
// install (cache.addAll is all-or-nothing).
const EXTRAS = ['/manifest.json', '/apple-touch-icon.png', '/og.png',
  '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png'];

function precacheList() {
  const urls = {};
  PAGES.forEach((page) => {
    urls[servedAs(page)] = 1;
    const src = fs.readFileSync(path.join(ROOT, page), 'utf8');
    let m;
    const re = new RegExp(ASSET.source, 'g');
    while ((m = re.exec(src)) !== null) {
      // Relative from a page a folder or two down; store it root-absolute,
      // which is what the browser will ask for either way.
      urls['/' + m[2].replace(/^(\.\.\/)+/, '') + '?v=' + version] = 1;
    }
  });
  EXTRAS.forEach((u) => {
    if (fs.existsSync(path.join(ROOT, u.slice(1)))) urls[u] = 1;
  });
  return Object.keys(urls).sort();
}

const SW = path.join(ROOT, 'sw.js');
const BLOCK = /(\/\* PRECACHE:START[^\n]*\n)[\s\S]*?(\/\* PRECACHE:END)/;

if (fs.existsSync(SW)) {
  const list = precacheList();
  const body = "var VERSION = '" + version + "';\nvar PRECACHE = [\n" +
    list.map((u) => "  '" + u + "'").join(',\n') + '\n];\n';
  const before = fs.readFileSync(SW, 'utf8');
  if (!BLOCK.test(before)) {
    console.error('stamp-assets: sw.js has no PRECACHE:START/END block to fill');
    process.exit(1);
  }
  const after = before.replace(BLOCK, (all, start, end) => start + body + end);

  if (check) {
    if (after !== before) {
      console.error('stamp-assets: sw.js precache list is stale (' + list.length +
        ' urls at v' + version + ').');
      failed = true;
    } else {
      console.log('stamp-assets: sw.js precaches ' + list.length + ' urls at v' + version);
    }
  } else if (after !== before) {
    fs.writeFileSync(SW, after);
    console.log('stamp-assets: sw.js precache list rewritten — ' +
      list.length + ' urls at v' + version);
  } else {
    console.log('stamp-assets: sw.js precache list is current (' + list.length + ' urls)');
  }
}

if (failed) {
  console.error('\nRun: node tools/stamp-assets.js');
  process.exit(1);
}
