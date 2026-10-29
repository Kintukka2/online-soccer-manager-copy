# OSMWiz Brand & Style Guide

The written companion to [`OSMWiz_Visual_System.html`](OSMWiz_Visual_System.html), which carries the live components.

- **Tokens:** [`tokens.css`](tokens.css) and [`tokens.json`](tokens.json).
- **Measurements:** every value traces to [`EVIDENCE.md`](EVIDENCE.md).

Snapshot: 29 October 2026, Online Soccer Manager 26/27.

---

## 1. The idea in one line

**Navy is theirs. The scarf is ours.**

OSMWiz shows Online Soccer Manager's data in the game's own measured visual language. Everything that is *ours* comes from the dressing room, so a reader always knows who is talking:
- the brand is knitted into a scarf;
- our analysis goes on a magnet tactics board;
- our accent is training-bib pink.

| Half | What it covers | Drawn in |
|---|---|---|
| **OSM**, the game's world | Cards, ratings, squads, fixtures, tactics settings, money, divisions | The measured system: navy, royal, sky, ice, gold, green, orange; Saira Condensed and the system grotesk |
| **WIZ**, ours | The brand, counter-tactic reasoning, editorial diagrams, teaching, full-screen empty states | The dressing room: the scarf, the magnet tactics board and bib pink `#FF3D7F`. Jersey 10 for the wordmark only |

Rule: **their data wears navy and gold; our thinking goes on the board.** Never both on one object.

---

## 2. Name and wordmark

- **OSMWiz** is the working name.
- **The mark is the W of the WM.**
  - Herbert Chapman's Arsenal (1925) played a shape named after two letters: the defence formed an M and the attack a W.
  - The mark is that W in magnets on a white tactics board. Four navy magnets and one bib-pink playmaker are joined by marker passes.
  - The wordmark completes the formation: the M of OSM sits against the W of WIZ.
- **The wordmark** is `OSMWIZ` in **Jersey 10**, a pixel face drawn from knitting charts. It has two forms:
  - **knitted** into the cream centre of a bar scarf, ink on cream between bib-pink bars, with fringe at both ends;
  - **flat**: OSM in `#899AA7`, WIZ in `#FFFFFF`, over a knitted pink rule.
- Never:
  - set OSM alone;
  - set the wordmark in one flat colour;
  - set the wordmark in Saira Condensed, which is the game's face;
  - use the game's orange in our identity. Ours is bib pink, which the game never renders.
- **Naming risk:** "OSM" is the universal shorthand for OpenStreetMap, and most "OSM" store results are map apps. Every store listing, page title and social bio carries "Online Soccer Manager" in full beside OSMWiz.

Disclaimer line, used verbatim in footers and store listings:

> OSMWiz is an independent companion for Online Soccer Manager. It is not made, endorsed or reviewed by Gamebasics B.V. or Miniclip.

---

## 3. Voice and tone

OSMWiz talks like a sharp assistant manager: numbers first, plain English, no hype.

| Do (illustrative copy, not data) | Don't |
|---|---|
| "4-3-3 B with Wing play wins 61% of logged matches against 5-3-2 at home." | "This INSANE tactic destroys everyone!!" |
| "Training Camp costs 10 BC now and 500 BC by the sixth." | "Unlock your squad's full potential." |
| "We haven't seen enough matches to rate this counter yet." | "Coming soon!" or a made-up percentage |
| "Unofficial. Built by OSM managers." | "The official OSM companion" |

- **Certainty is labelled.** A rule from the game's own data is stated plainly. A community heuristic says so ("Managers report…", "In 1,240 logged matches…"). This mirrors the [V]/[C] tagging in the research docs.
- **British football English,** as the game writes it: *line-up, defence, matchday, fixtures, friendlies*.
- **Short sentences, active voice.** A button says exactly what happens.
- **No pay-to-win upsell copy.** Never advise buying Boss Coins, and never link to coin sellers.

---

## 4. Vocabulary: the game's own words, spelled its way

| Area | Canonical terms |
|---|---|
| Money | **Club funds**, **Boss Coins** (BC). Never "cash", "gems" or "coins" alone |
| Squad | Squad, **Line-up**, Bench, Specialists (Captain, Penalties, Free kicks, Corners) |
| Ratings | **Att / Def / Ovr**. The line's main stat is Att for forwards, Ovr for midfielders, and Def for defenders and keepers |
| Positions | GK, CB, LB, RB, CDM, CM, CAM, LM, RM, ST, LF, RF |
| Tactics | **Game plan** (Long ball, Passing game, Wing play, Counter attack, Shoot on sight) |
| | **Tackling** (Careful, Normal, Aggressive, Reckless) |
| | **Line tactics** (Forwards: Drop deep / Support midfield / Attack only; Midfielders: Protect the defence / Stay in position / Push forward; Defenders: Defend deep / Attacking full-backs / Support midfield) |
| | Marking (Zonal, Man-to-man), Offside trap, Pressing, Style, Tempo |
| Staff | Universal / Attacking / Midfielder / Defending / Goalkeeper coach; **Claim progression**; Scout; **Data Analyst**; Doctor; Lawyer |
| Boosts | **Training Camp**, **Secret Training** |
| Competition | Next match, Matchday, Cup, **Winners Cup**, Divisions, Crews, Friendlies |
| Formations | `4-3-3 A` in prose; `4-3-3-B` only where the game itself prints it (the match strip) |

---

## 5. Copy style

- **Case:**
  - Display and buttons: Saira Condensed caps (`CLAIM PROGRESSION`, `MANCHESTER CITY`).
  - Labels and values: sentence case (`Game plan` / `Passing game`).
  - Table headers: sentence case (`Forward`, `Age`, `Nat`).
- **Numbers:**
  - Ratings are integers.
  - Money is abbreviated as the game does it: `200K`, `262M`.
  - Boss Coins are integers with "BC".
  - Percentages carry no space (`20%`).
  - Minutes use a typographic apostrophe (`64’`).
- **Labels pair with values:** a small sky label above a large white value (`Tackling` / `Normal`). Don't merge them into one sentence.
- **Errors** say what happened and what to do: "We couldn't read that screenshot. Crop it to the squad table and try again."
- **Empty states:**
  - Full screen: a tactics board, with magnets parked along the touchline, plus a heading and one sentence.
  - Inside a working panel: one muted line (`#899AA7`).

---

## 6. Colour (summary)

The full ramps are in the visual system and `tokens.css`. Each ramp has one job:

| Ramp | Job | Key values |
|---|---|---|
| **Navy** | Chrome and panels. Never black | `#020D17` `#0A1A2D` `#002037` `#022B4D` `#0B4169` |
| **Royal** | Backdrop behind panels | `#00165D` `#022F6D` `#154B96` |
| **Sky** | Information: table headers, links, help, labels | `#0096E3` `#00A8FF` `#00BBFE` `#5AC8FA` `#66DEFF` |
| **Ice** | In-card primary ("Claim progression") | `#D4FBFF` → `#99D6FB`, ink `#1E3459` |
| **Ring** | Rating circles | `#0A3E55` disc, `#49B9C6` ring |
| **Gold** | Prestige: frames, hairline, numerals, VS | `#A2855F` `#DFC091` `#E4C197` `#F2E6CA` |
| **Green** | Growth: training, fitness, division, wins | `#19560F` `#16B800` `#50F12E` `#00FA33` |
| **Orange** | Commit (theirs: never in our identity) | `#FC8C21` (hover `#EC781E`) |

Singles:

| Name | Value | Use |
|---|---|---|
| Select | `#FFE800` | Selected label |
| Draw | `#B37608` | D form chip |
| Star | `#E5A523` | Star-player badge |
| Danger | `#D9534F` | Destructive |
| Arrow | `#FC3018` | Sub out |
| Missed | `#00C7C8` | Missed chance |
| Disabled | `#B3B3B3` | Disabled controls |
| Paper | `#FFFFFF`, star row `#FFF8E5` | Squad table |

Ours, the dressing room (designed, not measured):

| Name | Value | Use |
|---|---|---|
| Bib pink | `#FF3D7F` (deep `#C21F5B`) | Our accent: our magnets, the arrowhead, the scarf bars, the wordmark rule |
| Scarf cream | `#F3EBDD` | Scarf centre |
| Marker ink | `#1C2733` | Marker strokes, scarf pinstripes |
| Board | `#F4F6F3` | Board surface |
| Printed lines | `#C5D0C9` | Board markings |
| Aluminium | `#9AA4AD` | Board frame |
| Their magnet | `#13233A` | Opposition |

Strength tiers, from the game's own code: **blue < 80, bronze 80+, silver 90+, gold 100+**.

Card colour is a **theme**, stored per card. It is never computed from rating.

---

## 7. Type (summary)

| Role | Face | Notes |
|---|---|---|
| Display, names, numbers, buttons | **Saira Condensed 800**, caps | The game's own face. Google Fonts, OFL |
| Labels, values, tables | **System grotesk** (Helvetica Neue / SF / Roboto) | Labels 400, values 700 |
| Web body | Saira Condensed 300 at 18px | The web client's computed body style |
| Wordmark only | **Jersey 10** | Ours: a knit-chart pixel face. Google Fonts, OFL. Never used for anything else |

VS and GOAL wordart (italic 800, metallic fill) belong to match-day components only.

---

## 8. Surfaces and texture

- **Navy, never black.** Every dark surface carries hue 205–215°.
- **Navy panels on royal ground.** Hero areas use royal with marble veins and floodlights.
- **Light from the top.** Raised elements get a lighter top rim, a gloss band over the upper half and a dark bottom bevel. These come verbatim from the web client's `.btn-new`.
- **Data goes light.** Squad tables are white paper with a sky header and a cream star row.
- **Texture layers:**
  1. gloss and bevel;
  2. gold hairline;
  3. marble veins;
  4. floodlights;
  5. card streak.

  All are CSS or inline SVG, with no image files and no grain.

---

## 9. Component index

These are all live in the visual system:

- top bar with currency pills and the gold hairline;
- buttons in eight roles: orange, ice, sky, green, navy, royal, red and grey;
- selection, where the label lights yellow;
- rating circles and tier rings;
- line-up card and empty slot;
- card themes;
- coach card with neon progress and an ice claim button;
- squad table;
- next-match panel with form chips;
- tactic card;
- match timeline;
- division shield;
- web dialog;
- the scarf and the scarf band;
- the board figure;
- the board empty state.

---

## 10. The dressing room (summary)

- **The scarf:**
  - A bar scarf, held up: bib-pink bars, ink pinstripes, a cream centre with the wordmark knitted in, and fringe at both ends.
  - One 8×6 SVG stitch tiles over the whole scarf.
  - The **scarf band** is the same stripes cut to 18px. It edges our editorial headers and share cards.
  - It never sits behind game data.
- **The board:**
  - A white melamine tactics board in an aluminium frame, with pitch markings printed in light grey.
  - Marker width 3.5 per 100 units, with round caps and joins and dash `9 6`.
  - Magnets have `r 4.6`, a white rim and a 0.9-unit shadow. That shadow is the only one in our half.
- **Five marks:**
  - Our magnet (bib pink): one of ours.
  - Their magnet (navy): one of theirs.
  - Dashed: still to come.
  - Solid: already played.
  - Arrowhead (bib pink): where it ends. Exactly one per board.
- **Refusals:**
  - never on a card;
  - never a game-owned number (a magnet carries a position code at most);
  - never chrome;
  - never grass;
  - one board per screen;
  - never the game's orange.
- **Distinctness:** the board must never resemble the game's own diagrams, which are glossy 3D pitches with red tube arrows, or flat green fields with blue arrows. A white board with printed lines cannot.

---

## 11. Rules

1. **Navy, never black.**
2. **Light from the top.**
3. **Gold frames, never fills.**
4. **Green means growth.**
5. **Selection lights the label** (`#FFE800`), never a rim.
6. **Data goes light.**
7. **Navy reports, the board explains.**

---

## 12. Limits (legal and brand)

Gamebasics' Terms (A.7) reserve its names, logos and designs, and ban reverse engineering.

- **No game logos or marks:**
  - no OSM wordmark;
  - no white-outlined orange letterforms;
  - no gold "26/27";
  - no "25 Years" ribbon.
- **The acronym only inside our wordmark.** "Online Soccer Manager" is written out only to name the game.
- **No official framing.** Nothing that implies endorsement or affiliation.
- **No licensed imagery:**
  - no player photography;
  - no club crests;
  - no mascots or characters;
  - no Boss Coin or cash icon replicas.
- **No lifted art.** Textures are CSS approximations. No assets are taken from the app package, and no decompiling.
- **Data comes from players.** Data comes from player-submitted screenshots, as fhcwiz does, unless Gamebasics gives written approval for anything else (Terms A.6). The companion never asks for a password or session token.

---

## 13. Files

| File | What it is |
|---|---|
| `OSMWiz_Visual_System.html` | The visual system: live components, standalone |
| `tokens.css` | Every colour, font and texture as CSS custom properties |
| `tokens.json` | The same tokens in design-token JSON, plus radii, shadows and tier thresholds |
| `EVIDENCE.md` | Sources, method, and all 110 measured regions |
| `measure/` | The sampler, the region definitions and the screenshot fetch script, to reproduce every value |
