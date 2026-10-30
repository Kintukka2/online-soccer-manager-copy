# Changelog

All notable changes to OSMWiz. Versions follow [VERSIONING.md](VERSIONING.md).

## 0.1.0 — first release

The first working version of the app, built on the visual system in `docs/brand/`.

### Squad strength
- Enter your squad by position, Attack and Defence. Overall is worked out with the game's own formula: (Att + Def) / 2, rounded down.
- The strength badge is calculated the way the game's line-up screen does it:
  - take the best N players per line for the formation, by the stat that line counts (Att for forwards, Ovr for midfielders, Def for defenders and keepers);
  - average them and round.
- The badge also shows per-line circles and the tier ring: blue below 80, bronze 80+, silver 90+, gold 100+.
- The line-up is drawn on the pitch in gold-framed cards, with empty slots where a line is short. A warning appears when a formation cannot be filled.
- "Best formations for this squad" ranks all twelve shapes by the exact average the badge rounds. A shape the squad cannot fill sinks to the bottom.
- An example squad with role names, never real players, is loaded on first visit and can be cleared.

### Tactics
- **Formations:** all twelve shapes drawn on the magnet tactics board, with A and B midfield layouts where the game's are known.
- **Game plans:** the five game plans, with the pairings most guides agree on, marked as community.
- **Tackling, referees and the rest:** tackling levels, referee strictness, line tactics, marking and the offside trap.
- **Sliders:** pressing, style and tempo by situation, from October 2026 guides, marked as community.

### Calculators
- **Training Camp cost:** the next camp and the running total, 10 → 500 BC, six per league.
- **Savings interest:** 2% per match, compounding.
- **Training time:** sessions and coach hours from one rating to another, as a best-to-worst range, with the Training Facility.
- **Asking price:** the 0.75× to 2.5× value band.
- **One training level:** the stats each line gains. This one is a game rule.

### Match log
- Log each result with your formation, game plan, tackling, the opponent's formation and the referee.
- Your record by set-up and against each opposing formation, in points per game.

### Everything else
- **Storage:** data is kept in `localStorage` under `osmwiz-v1`, with Export and Import as a JSON file.
- **Install:** an installable PWA with offline support on the published site.
- **Images:** icons and social card drawn from the WM mark and the scarf.
- **Tests:** 35 tests over the engine, the pages, the tactics board and storage migration.
