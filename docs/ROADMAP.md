# OSMWiz Roadmap

What 0.1.0 shipped, what comes next, and why in that order. The order follows the gap matrix in [`COMPANION-LANDSCAPE.md`](COMPANION-LANDSCAPE.md) §8: build first what nobody offers and the game's rules already let us compute.

## 0.1.0 (shipped)

- **Squad strength:** the game's own badge formula, a ranking of every formation, and the line-up on the pitch.
- **Tactics reference:** all twelve shapes on the magnet board, game plans, tackling, line tactics and sliders.
- **Calculators:** Training Camp, savings interest, training time, asking price and level-up.
- **Match log:** results with set-ups, and records by set-up and by opposing formation.
- **Infrastructure:** PWA, offline, export and import, CI gate and voice tripwire.

## 0.2: get real squads in faster

The slowest part of 0.1.0 is typing a squad. Players already have the numbers on screen.
- **Paste a squad.** Read a pasted block of text (name, position, Att, Def) into the squad table in one go.
- **Screenshot import, on the device.** The reader picks a screenshot of their squad screen and the app reads Att, Def and position from it in the browser, with nothing uploaded.
  - This is the data route the Terms allow (A.6): the player's own screen, read by the player.
  - Needs the in-game screenshots requested for the visual system, to learn the squad screen's layout.
- **Several squads.** One per manager slot (the game allows four), with a switcher in the top bar.

## 0.3: the counter finder

- Pick the opponent's formation, the venue and the strength gap. Get a starting set-up:
  - formation;
  - game plan;
  - pressing, style and tempo;
  - line tactics.
- The rules come from the community meta. Labelled as community, and explained with one tactics board per answer.
- When the reader's own match log has results for that matchup, show their record beside the advice.

## 0.4: outcome-validated tactics

- **Opt-in sharing** of match-log entries. Results only, nothing personal and no account, through a small serverless endpoint.
- **Aggregated win rates** per formation, game plan and slider band against each opposing shape. This is the data moat from the landscape doc §9: every rival's counters are opinion, and these would be measured.
- Needs a privacy page and a decision on hosting before it starts.

## 0.5: the player encyclopedia

- Indexable pages per player, with Att, Def, Ovr, position, club and value across rating updates.
- Built only from player-submitted screenshots, the fhcwiz way, with each value's date and source.
- Prerendered pages and a sitemap, using the prerender and card-page tools proven in the FHCWiz repo.

## Later

- **Discord bot:** `/strength`, `/counter 4-3-3B away 85v89` and fixture reminders. There is no competition here.
- **Share cards** for WhatsApp and Discord: the next-match panel or a tactics board, edged with the scarf band.
- **Localisation:** Turkish, Arabic, Brazilian Portuguese, Indonesian and Dutch, OSM's largest markets.
- **Club picker:** compare every club in a league by its strength before signing.

## Open decisions

- **Domain.** `osmwiz.com` is a placeholder in the tools and the social card. Pick and buy one, then change the one constant in each tool.
- **Name.** OSMWiz is the working name, and "OSM" collides with OpenStreetMap in search results.
- **Written approval from Gamebasics** (Terms A.6). Needed before any automated data access. Worth asking early, since FHCWiz's experience with the same studio is the best precedent.
