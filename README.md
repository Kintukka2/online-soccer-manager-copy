# OSMWiz

Free tools for **Online Soccer Manager (OSM)**, the multiplayer football management game by Gamebasics / Miniclip Nederland:
- the squad strength badge, worked out the way the game does it;
- the formation that gets the most from your squad;
- tactics on a magnet tactics board;
- calculators for Training Camps, savings, training time and asking prices;
- a match log that shows which set-ups win.

Everything runs in the browser. No account, no network, no build step.

A fan project. Not made, endorsed or reviewed by Gamebasics B.V., and no connection to them or Miniclip. No art or assets from the game are used: every card, badge and texture here is drawn in code.

## Running it

Serve the folder with any static server, then open it:

```sh
python3 -m http.server 8431           # or: powershell -File tools/serve.ps1 -Port 8431
```

Opening `index.html` straight off disk mostly works, but some browsers refuse `localStorage` on `file://`, which is where your data lives.

## Tests

- **In the browser:** open `tests.html`.
- **Headless, as CI does it:**

  ```sh
  npm install --no-save playwright@1.49.1 && npx playwright install chromium
  node tools/run-tests.js
  ```

  It fails on a failed assertion, on a page error, and on any route that throws or scrolls sideways at 1280 or 390 wide.

## Project layout

```
index.html         app shell
tests.html         in-browser test runner
css/styles.css     the visual system, applied
js/data.js         the game's rules, each tagged game or community, and VERSION
js/engine.js       all pure logic: strength, ranking, calculators, records
js/board.js        the magnet tactics board, as SVG strings
js/store.js        localStorage, migration, export and import
js/ui.js           page markup, no logic
js/app.js          routing, events and boot
js/*.test.js       the test suites (never published)

tools/run-tests.js     runs tests.html and every route headless; CI gates on it
tools/voice-check.js   copy tripwires from docs/voice.md
tools/stamp-assets.js  writes the version onto asset URLs and the service worker's list
tools/build-site.js    builds public/ from an allowlist for Cloudflare Pages
tools/make-images.js   renders the icons and og.png from the identity
```

## Documentation

- **`CLAUDE.md`:** working agreements for this repository.
- **`VERSIONING.md` and `CHANGELOG.md`:** the release rules and the history.
- **[`docs/OSM-ANALYSIS.md`](docs/OSM-ANALYSIS.md):** the complete analysis of the game. Every rule the app uses traces back here.
- **[`docs/COMPANION-LANDSCAPE.md`](docs/COMPANION-LANDSCAPE.md):** the companion apps and sites around OSM, and where OSMWiz fits.
- **[`docs/brand/`](docs/brand/):** the OSMWiz brand and visual system. It holds the live system page, the brand and style guide, the design tokens, and the evidence for every measured value.
- **`docs/voice.md`:** how the app writes.
