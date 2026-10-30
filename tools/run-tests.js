#!/usr/bin/env node
// Runs the suite in headless Chromium and exits non-zero if anything is
// wrong, so it can gate a push instead of only being green whenever somebody
// remembers to open the page.
//
// Two parts.
//
// 1. tests.html, the in-browser harness. It fails on a page error or a
//    console error as well as on a failing assertion, and that is not
//    belt-and-braces: a syntax error inside a .test.js file throws at parse
//    time, which drops every test below it from the suite without failing
//    anything. FHCWiz lost half its suite that way once, and the page still
//    read as all-passing. For the same reason, a run in which no test ran at
//    all is a failure, not a pass.
//
// 2. index.html, the real app, at 1280 wide and at 390 wide (the phone most
//    readers hold). Every route must load with no page error, no console
//    error and nothing wider than the screen. tests.html does not load the
//    app shell, so routing, rendering and layout are invisible to it; in
//    FHCWiz a boot-time ReferenceError and tables scrolling sideways on a
//    phone both shipped behind a green suite.
//
// Both are opened from file://, as a contributor opening them by hand would.
//
// Playwright is installed ad hoc rather than through a manifest, matching how
// .gitignore says this repo treats verification tooling.
//
// Usage: node tools/run-tests.js
'use strict';

const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('FAIL  Playwright is not installed. Run:\n' +
    '      npm install --no-save playwright@1.49.1 && npx playwright install chromium');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const fileUrl = (rel) => 'file://' + path.join(ROOT, rel);

// The sandbox this is developed in keeps its browsers outside the default
// cache; a plain `npx playwright install chromium` puts them inside it. Prefer
// whichever actually exists rather than assuming either.
const PINNED = '/opt/pw-browsers/chromium';
const launch = fs.existsSync(PINNED) ? { executablePath: PINNED } : {};

// Every route the app shell answers. A new tab gets a line here.
const ROUTES = ['#/', '#/squad', '#/tactics', '#/calculators', '#/log', '#/about'];

// Not `isMobile` for the phone: mobile emulation widens innerWidth to fit
// whatever overflows, so a 600px element on a 390px screen reads as a 608px
// screen and the check below passes on exactly the fault it exists for.
// hasTouch alone keeps the touch media queries honest.
const WIDTHS = [
  { viewport: { width: 1280, height: 900 } },
  { viewport: { width: 390, height: 844 }, hasTouch: true }
];

// Time for anything the app defers after a load or a hash change.
const SETTLE = 300;

// Google Fonts are answered with an empty stylesheet rather than fetched. The
// runner has to give the same answer offline as online, and a font that does
// not arrive is a fallback face, not a fault in the app.
async function quietFonts(ctx) {
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (r) =>
    r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
}

// Page errors and console errors, each tagged with where the page was at the
// time. A failed resource logs "Failed to load resource" with no address, so
// the address is added from the message's location.
function listen(page, sink, where) {
  page.on('pageerror', (e) => sink.push(where() + ': page error: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const at = (m.location() || {}).url || '';
    const shown = at.replace('file://' + ROOT + path.sep, '');
    sink.push(where() + ': console error: ' + m.text() +
      (at && m.text().indexOf(at) === -1 ? ' (' + shown + ')' : ''));
  });
}

/* ---------- 1. the harness ---------- */

async function harness(browser) {
  const problems = [];
  if (!fs.existsSync(path.join(ROOT, 'tests.html'))) {
    return { results: null, problems: ['tests.html does not exist'] };
  }
  const ctx = await browser.newContext();
  await quietFonts(ctx);
  const page = await ctx.newPage();
  listen(page, problems, () => 'tests.html');
  await page.goto(fileUrl('tests.html'));

  // Promise.resolve, so a runTests() that ever turns async still reads right.
  const results = await page.evaluate(() => {
    if (!window.OSM || typeof window.OSM.runTests !== 'function') return null;
    return Promise.resolve(window.OSM.runTests()).then((all) => (all || []).map((r) => ({
      pass: !!r.pass, name: String(r.name), message: r.message ? String(r.message) : ''
    })));
  });
  await ctx.close();
  return { results, problems };
}

/* ---------- 2. the app at both widths ---------- */

// The outermost elements that run past the right edge, so a failure names
// something to look at rather than only a width. Anything inside a box that
// clips or scrolls sideways (the tab rail does) cannot widen the page, so it
// is not named.
function overflow() {
  const vw = window.innerWidth;
  const out = [];
  const contained = (e) => {
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') return true;
    }
    return false;
  };
  document.querySelectorAll('body *').forEach((e) => {
    if (out.length >= 3) return;
    const r = e.getBoundingClientRect();
    const parent = e.parentElement && e.parentElement.getBoundingClientRect();
    if (r.width && r.right > vw + 1 && (!parent || parent.right <= vw + 1) && !contained(e)) {
      out.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
        (typeof e.className === 'string' && e.className.trim()
          ? '.' + e.className.trim().split(/\s+/).join('.') : '') +
        ' ends at ' + Math.round(r.right) + 'px');
    }
  });
  return { sw: document.documentElement.scrollWidth, vw, culprits: out };
}

async function shell(browser) {
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) return ['index.html does not exist'];
  const problems = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: w.viewport, hasTouch: !!w.hasTouch });
    await quietFonts(ctx);
    const page = await ctx.newPage();
    let route = ROUTES[0];
    const where = () => 'index.html ' + route + ' at ' + w.viewport.width + 'px';
    listen(page, problems, where);

    await page.goto(fileUrl('index.html') + route);
    await page.waitForTimeout(SETTLE);
    for (const next of ROUTES) {
      route = next;
      await page.evaluate((h) => { location.hash = h; }, route);
      await page.waitForTimeout(SETTLE);
      const o = await page.evaluate(overflow);
      if (o.sw > o.vw + 1) {
        problems.push(where() + ': scrolls sideways, page is ' + o.sw + 'px on a ' + o.vw +
          'px screen' + (o.culprits.length ? ' (' + o.culprits.join('; ') + ')' : ''));
      }
    }
    await ctx.close();
  }
  return problems;
}

/* ---------- run ---------- */

// A hang is the one result this runner could not otherwise report: a run
// still going after two minutes is a fault, not a slow pass.
setTimeout(() => {
  console.error('FAIL  the suite did not finish inside two minutes — something is hanging');
  process.exit(1);
}, 2 * 60 * 1000).unref();

(async () => {
  const browser = await chromium.launch(launch);
  let suite;
  let app;
  try {
    suite = await harness(browser);
    app = await shell(browser);
  } finally {
    await browser.close();
  }

  const fails = [];
  const results = suite.results;
  if (results === null) {
    if (fs.existsSync(path.join(ROOT, 'tests.html'))) {
      fails.push('OSM.runTests() never loaded — a test file probably threw at parse time');
    }
  } else if (!results.length) {
    fails.push('tests.html ran 0 tests — a suite that tests nothing is not a pass');
  }
  if (results && results.length) {
    const passed = results.filter((r) => r.pass).length;
    console.log('tests.html: ' + passed + ' / ' + results.length + ' passing');
    results.filter((r) => !r.pass).forEach((r) =>
      fails.push(r.name + (r.message ? '\n      ' + r.message : '')));
  }
  fails.push(...suite.problems);

  if (!app.length) {
    console.log('index.html: ' + ROUTES.length + ' routes at ' +
      WIDTHS.map((w) => w.viewport.width + 'px').join(' and ') +
      ', no errors and nothing wider than the screen');
  }
  fails.push(...app);

  fails.forEach((f) => console.error('FAIL  ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  console.error('FAIL  the runner itself broke: ' + e.message);
  process.exit(1);
});
