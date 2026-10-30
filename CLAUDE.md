# Working agreements

Standing instructions for Claude Code on this repository. The rules that govern the *product* live elsewhere, and this file points at them rather than restating them:

- `VERSIONING.md`
- `docs/voice.md`
- `docs/brand/BRAND-GUIDE.md`

A rule written down twice is a rule that will disagree with itself.

## Reporting back

**Give the pull request URL in full every time a pull request is ready to merge.**
- Not the number, and not "the PR": the address, on its own line, so it can be tapped from a phone.
- That covers the first time it opens and every later point it becomes mergeable: after CI turns green, after a fix is pushed, after a conflict is resolved.
- State the version alongside it.

## Branch and release

- Develop and push only to the branch the session names. Never push to `main`.
- When a pull request merges, restart the branch from the merged `main` before starting the next piece of work. Never stack new work on merged history.
- Any change under `js/` or `css/` needs a version bump. `VERSIONING.md` has the rules and the release steps.

## Data

- **Never invent a rating, a stat, a price or a date, and never fabricate anything about a real player.**
  - The example squad uses role names for exactly this reason.
- **Every game figure carries its source.** `js/data.js` tags each value:
  - **V**: read from the game's web client or an official page.
  - **C**: community.
- **The app shows the difference** with the "Game rule" and "Community figure" chips. A community figure is never shown as the game's own number.
- **Colours and type come from `docs/brand/`.** They were measured from the game, never chosen by eye. New values are measured the same way (`docs/brand/EVIDENCE.md`).
- **No game art, logos, crests, photos, mascots or app-package assets.** Ever. Everything visual is drawn in code.
- **Never decompile the game.** Gamebasics' Terms A.7 forbid it.
- **Never ask a reader for an OSM password or session token.**

## Writing

- **The rule books:**
  - `docs/voice.md` governs every word a reader sees.
  - `docs/brand/BRAND-GUIDE.md` §3–§5 adds OSMWiz's voice, the game's vocabulary and copy style.
  - `tools/voice-check.js` is the tripwire. When it fires, rewrite the sentence; don't work around the pattern.
- **Never name one of our own files in anything a reader sees.**
- **Two halves, never mixed on one object:**
  - The game's data wears the measured navy-and-gold system.
  - Our reasoning goes on the magnet tactics board.

## Code

- **Zero-build:**
  - The app is plain `<script>` tags on the `window.OSM` namespace.
  - No modules, no bundler, no runtime dependencies.
- **Logic and markup stay separate:**
  - `js/engine.js` holds the logic and touches no DOM.
  - `js/ui.js` builds markup and holds no game logic.
  - `js/app.js` is the only file that touches the page.
  - Keeping it that way is what makes the engine testable without a browser shell.
- **Saved data:**
  - Everything saved goes through `js/store.js`.
  - A change to its shape goes through `migrate()`.

## What the site publishes

Cloudflare Pages publishes only `public/`, which `tools/build-site.js` builds from an allowlist.
- Every top-level file or folder must be listed there as site or private, and the build refuses to run until a new one is.
- Anything marked site is readable by anyone.

## Before pushing

```
node tools/run-tests.js       node tools/voice-check.js
node tools/stamp-assets.js    node tools/build-site.js
```

Then look at the change in a browser twice: at 1280 wide and at 390 wide. Most readers are on a phone, so anything under `js/` or `css/` is a phone change, whether or not it was meant as one.
