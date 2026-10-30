#!/usr/bin/env node
// Renders the app icons and the social preview card from the identity in
// docs/brand: the WM mark (five magnets on the tactics board) and the scarf.
// Drawn in code, like everything else in the identity, so there is no source
// artwork to keep in step and nothing from the game is used.
//
// Writes icon-192.png, icon-512.png, icon-maskable-512.png,
// apple-touch-icon.png (180) and og.png (1200x630) at the repo root.
//
// Usage: node tools/make-images.js
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PINNED = '/opt/pw-browsers/chromium';
const launch = fs.existsSync(PINNED) ? { executablePath: PINNED } : {};

const NAVY = '#0A1A2D';
const PINK = '#FF3D7F';
const THEM = '#13233A';
const INK = '#1C2733';

function magnet(x, y, r, fill) {
  return `<circle cx="${x + 1.2}" cy="${y + 1.2}" r="${r}" fill="rgba(0,0,0,.2)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="1.6"/>`;
}

// The mark, as docs/brand/OSMWiz_Visual_System.html draws it.
const MARK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 88">' +
  '<rect x="2.5" y="2.5" width="95" height="83" rx="8" fill="#F4F6F3" stroke="#9AA4AD" stroke-width="3"/>' +
  '<path d="M2.5 44 H97.5" stroke="#C5D0C9" stroke-width="1.2"/>' +
  `<path d="M18 26 L34 62 L50 36 L66 62 L82 26" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>` +
  magnet(18, 26, 7.2, THEM) + magnet(34, 62, 7.2, THEM) + magnet(66, 62, 7.2, THEM) + magnet(82, 26, 7.2, THEM) +
  magnet(50, 36, 7.2, PINK) + '</svg>';

// size: canvas; inset: share of the canvas the mark may use.
function iconPage(size, inset) {
  const w = Math.round(size * inset);
  return `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:${NAVY};display:grid;place-items:center">` +
    `<div style="width:${w}px">${MARK.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}</div></body></html>`;
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Jersey+10&family=Saira+Condensed:wght@700;800&display=swap';
const KNIT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='6'%3E%3Cpath d='M0 0.5 L4 5 L8 0.5' fill='none' stroke='rgba(0,0,0,0.17)' stroke-width='1.3'/%3E%3C/svg%3E\")";

// The band's stitch is a data URI full of quotes, so it lives in a style
// block: inside a style="" attribute its first double quote ends the attribute.
const OG = `<!doctype html><html><head><link rel="stylesheet" href="${FONTS}">
<style>.band{position:absolute;left:0;right:0;bottom:0;height:34px;background:${KNIT},linear-gradient(180deg,${PINK} 0 36%,${INK} 36% 46%,#F3EBDD 46% 64%,${INK} 64% 74%,${PINK} 74%)}</style></head>
<body style="margin:0;width:1200px;height:630px;overflow:hidden;font-family:'Saira Condensed',sans-serif;color:#fff;
  background:radial-gradient(60% 55% at 16% -8%,rgba(150,195,255,.30),transparent 70%),radial-gradient(55% 50% at 86% -10%,rgba(150,195,255,.24),transparent 70%),linear-gradient(180deg,#04173A 0%,#022F6D 55%,#00165D 100%)">
  <div style="position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(90deg,#A2855F,#DFC091 20%,#F2E6CA 50%,#DFC091 80%,#A2855F)"></div>
  <div style="position:absolute;left:80px;top:96px;display:flex;align-items:center;gap:34px">
    <div style="width:190px">${MARK.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}</div>
    <div style="font-family:'Jersey 10',monospace;font-size:150px;line-height:.9;letter-spacing:.02em"><span style="color:#899AA7">OSM</span>WIZ</div>
  </div>
  <div style="position:absolute;left:80px;top:330px;font-weight:800;font-size:66px;line-height:1;text-transform:uppercase;max-width:1040px">
    Squad strength, tactics<br>and calculators</div>
  <div style="position:absolute;left:80px;top:478px;font-weight:700;font-size:34px;color:#66DEFF">For Online Soccer Manager. Built by players.</div>
  <div class="band"></div>
</body></html>`;

async function shot(browser, html, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.screenshot({ path: path.join(ROOT, file), clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  console.log('make-images: ' + file + ' ' + w + 'x' + h);
}

(async () => {
  const browser = await chromium.launch(launch);
  try {
    await shot(browser, iconPage(192, 0.86), 192, 192, 'icon-192.png');
    await shot(browser, iconPage(512, 0.86), 512, 512, 'icon-512.png');
    // A maskable icon is cropped to a circle or squircle by the launcher, so
    // the mark keeps to the inner 60% safe zone.
    await shot(browser, iconPage(512, 0.6), 512, 512, 'icon-maskable-512.png');
    await shot(browser, iconPage(180, 0.82), 180, 180, 'apple-touch-icon.png');
    await shot(browser, OG, 1200, 630, 'og.png');
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error('make-images: ' + e.message); process.exit(1); });
