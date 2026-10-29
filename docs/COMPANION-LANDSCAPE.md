# OSM Companion Apps & Sites: Competitive Landscape

Research snapshot: **29 October 2026**, during OSM 26/27.

This maps every third-party product built around Online Soccer Manager: apps, websites, extensions, bots, code and creators. It is the market context for a companion product in the mould of **fut.gg / futbin** (EA FC) and **fhcwiz.com** (Football Head Coach 27). Game mechanics are covered in [`OSM-ANALYSIS.md`](OSM-ANALYSIS.md).

How claims are marked:

| Tag | Meaning |
|---|---|
| **[V]** | The page or store listing was loaded and checked |
| **[S]** | Seen only in search results |

---

## 1. Bottom line

1. **The field is crowded with small, fragmented tools, and none is a fut.gg.**
   - Three Android apps have 100K–500K+ installs.
   - About ten live websites exist, four of them on domains registered in 2026.
   - Every one is a solo or hobby operation.
   - Every one is unofficial.
   - None is excellent on all three of iOS, Android and web.
2. **Tactics is saturated; data is not.**
   - Counter-tactic engines are everywhere: hand-made matrices, AI chatbots, "simulations".
   - Nobody has built the futbin layer: **indexable per-player pages**, **rating and value history**, **Legends/In-Form catalogues**, **budget squad building**, **club pickers** or **training and boost calculators**.
3. **The money is real but small.**
   - The only revenue-verified business, *OSM Tactics*, makes **$861 MRR from 94 subscribers** (RevenueCat, via TrustMRR) [V].
   - Its iOS app is **for sale on Flippa at $22K**, on ~$12.7K trailing annual revenue and ~5K downloads/month [V].
   - Success here means owning the category across languages and platforms, not copying one feature.
4. **Data access is the strategic constraint.**
   - OSM's Terms forbid API use, scraping and reverse engineering without Gamebasics' written approval. They also forbid account sharing, which rules out "log in with OSM".
   - Two models comply:
     - **fhcwiz**: community-submitted screenshots, no accounts, local storage.
     - **fut.gg**: an official publisher partnership.
   - fhcwiz already runs this playbook for **Gamebasics' own other game**, Football Head Coach 27.

---

## 2. The reference models

| | **fut.gg** | **futbin** | **fhcwiz.com** |
|---|---|---|---|
| Game | EA FC Ultimate Team | EA FC Ultimate Team | Football Head Coach 27, **by Gamebasics, OSM's studio** |
| Core | Player DB, SBC solver, squad builder, Evolutions lab, objectives tracker, market momentum, leaderboards | Player DB, prices, SBC solutions, squad builder | Player Trade Challenge (PTC) solver, PTC list, player DB (filters, CSV/JSON import/export, personal price log), 53-player team builder, game-plan tool (beta), pack odds, blog |
| Data | **Official EA community partner**; users link their EA account | Market scraping plus community | **Community screenshots sent by email**; "may be wrong or out of date" |
| Accounts | Yes (EA sync) | Yes | **None**. Data stays in the browser; installable PWA that works offline |
| Status | Official partner | Independent | "Not official, not endorsed by Gamebasics/Miniclip" |

Sources: fut.gg, fhcwiz.com [V]. futbin.com blocked automated access.

**Takeaway:** fhcwiz shows that a Gamebasics game can carry a credible, unofficial, login-free companion. fut.gg shows what a publisher partnership unlocks: account sync, live data, legitimacy.

---

## 3. Rules of the road: OSM Terms (last updated 5 Apr 2023) [V]

| Clause | Rule | Consequence for a companion |
|---|---|---|
| A.6, Rule 1 | You may not use the APIs or scrape, collect or use website data **without prior written approval** | Automated data pulls need Gamebasics' sign-off |
| A.7 | No reverse engineering, decompiling or modifying the Services | No client-traffic interception or hooking (two GitHub tools do exactly this) |
| A.6, Rule 2 | No cheats, bots, hacks, mods or "unauthorised third-party software designed to modify the Services" | A read-only companion is fine; anything that automates play is not |
| A.4 / B.6 | No sharing credentials or enabling third-party account access | "Log in with your OSM account" is off-limits without a partnership |
| A.7 / A.14 | Content and marks belong to Gamebasics/Miniclip. Services are "for personal and not commercial use". Users "should not seek to … earn money" from Gamebasics materials, though monetising gameplay videos is "generally acceptable" | Ads or subscriptions on a fan product sit in a grey zone. Gamebasics can ask for removal. Use no logos and no "official" claims |
| B.2 | No third-party selling of Boss Coins or virtual items | Never touch currency or account trading |

**What competitors do today** [V/S]:
- Most tools present themselves as unofficial and run ads or subscriptions.
- Several appear to pull data automatically: OSM Helper's live crew rankings and mgtools' "daily changes" log suggest it (inference).
- At least two GitHub extensions intercept the logged-in session.
- Several community tools ask users for passwords or session tokens.

That is a trust problem across the category, and an opening for a product that never asks for credentials.

---

## 4. Mobile apps

Play Store figures were fetched directly on 29 Oct 2026 [V].

| App | Developer | Platforms | Installs / rating | Last update | Money | What it does |
|---|---|---|---|---|---|---|
| **OSM Guide** | AppBasics | Android | **500K+**, 4.2★, 4.7K reviews | 20 Oct 2026 | Ads | Curated tactics and counters; "AI" generator that "runs 50 simulations"; scout DB of 40K+ players; sell-price estimator; saved/shared tactics; multilingual. Sister site osmtacticsassistant.com claims "750K+ users" |
| **OSM Tactics, AI Tactics** | Tarik Fatih Pınarcı (Sweden) | Android, iOS, web | **100K+**, 4.3★, 2.73K reviews; iOS 4.3★ from 55 ratings | 20 Jul 2026 (Android); 13 Aug 2026 (iOS) | Ads + subscription ($4.99/wk, $7.99/mo, $49.99–99.99/yr) + coin packs | Enter the opponent's formation and get a counter (formation, sliders, line tactics); formation library; AI coach chat; AI tactic builder. English only. **$861 MRR, 94 subs [V]. iOS app for sale at $22K [V]**. Website osmtacticsapp.com was failing TLS on 29 Oct [V] |
| **OSM Helper – Scout & Tactic** | Lidevs | Android, web (osmhelper.com) | **100K+**, **3.5★**, 1.16K reviews | 21 Oct 2026 | Ads + IAP + monthly/yearly plans (no ads, AI credits) | The widest feature set: AI chat, scout DB with compare, community tactics with voting, Dream Team builder (24 formations), Battle League, crew Battle Sheet, top-100 crews and live crew battles, predictions, draw tool, YouTuber feed. 11 languages |
| **OSM Scout** | Stefano Tasinato | Android, iOS | 10K+, 4.2★, 528 reviews; iOS 4.5★ (6 ratings) | 11 Oct 2026 | Ads + IAP | Player filter (position, age, quality, nationality, league), favourites. EN/IT/PT/ES |
| Osm Counter Tactics | VainM | Android | 10K+, 4.1★ [S] | 27 Nov 2025 | None | Static counter list; stale |
| OSM Scouting | Doonstein | Android | 50+ | Launched 16 Aug 2026 | IAP | "Smart Scout": odds of hitting your target in the scout pool; league and club analysis. EN/ES/PT |
| Tactics and Scout Assistant / OSM Data Analyste | AppBasics | Android | 1K+ each | 2025–Feb 2026 | Ads | Clones of OSM Guide; stale |
| OSM Transfer: Scout List | Diego Arraez | iOS | 4.3★ (29 ratings) | Sep 2023 | $0.99 | Abandoned |

**Not found:** any store-listed iOS companion with real traction, any tablet-optimised app, any app in Arabic/Turkish-first UX despite those being OSM's biggest markets.

---

## 5. Websites

| Site | Status | Offer | Fresh? | Langs | Money | Verdict |
|---|---|---|---|---|---|---|
| **osmhelper.com** | Live [V] | Scout DB with compare and In-Form tab; scout price calculator; Dream Team builder; community tactics; **crew top-100 with medal diffs and battles**; leagues (team count, squad values); Battle League; events calendar; YouTuber directory; AI assistant | 26/27 | **11** | AdSense + tiers "from $2/mo" | **Strongest all-round hub, the main rival.** Its DB shows a single rating, not Att/Def/Ovr |
| **osmnextlevel.com** | Live [V] | Free counter engine (formation × venue × relative strength gives formation + Pressure/Style/Tempo); weekly meta; quick-sale multipliers; **premium**: per-fixture engine, Gemini reader for Data Analyst screenshots, analytics | **26/27**, updated Sep 2026; domain registered Jun 2026 | EN, TR | Premium via Buy Me a Coffee; no ads | Freshest, most credible tactics; operator claims to be a former World No. 1 manager. No player data |
| **osmtacticsassistant.com** | Live [V] | **"+40K players" scout list with ATT/DEF/OVR and value filters**; price estimator; AI tactics; match tester; library; chatbot | 2026; domain Jan 2026 | EN, IT, PT | AdSense + Ko-fi + paid guide | Broad, SEO-heavy; tied to the OSM Guide app |
| **mgtools.cloud/games/osm** | Live [V] | **Most futbin-like table**: name, age, nationality, club, position, Attack, Defence, Overall, value; filters; "Updates" daily change log; month events | Unclear | EN | Analytics only | Closest to futbin, low polish, no community. Part of a multi-game tools hub |
| osmsim.com | Live [V] | Browser match simulator: enter two squads and tactics, get a minute-by-minute result; shareable links | Domain Aug 2026 | 7 | None | Novel, unproven engine |
| osmcoach.com | Live [V] | Matchup builder (formation, strength, venue, **referee**); checklists; guides; Chrome helper "in development" | Domain Aug 2026 | EN | Ad slots reserved | Early-stage |
| osmtactic.com / osmtactics.nl | Live [V] | Articles on formations, counters, events | Last post Apr 2026 | 9 | AdSense | SEO reach, thin and apparently mass-produced content |
| osmguide.com | Live [V] | Beginner guide, counter images; Players section "under maintenance" | Undated | EN | AdSense | Legacy |
| osmhispano.blogspot.com | Live [V] | Spanish counters and news | 2023 | ES | AdSense, donations | Stale |
| online-soccer-manager.fandom.com | Live [S] | Mechanics wiki | Thin (15 short pages) | EN, NL | Fandom ads | Reference only |
| osmtransfer.com, scoutlist.altervista.org | **Dead** [V] (no DNS) | Were Att/Def/Ovr scout databases | — | — | — | The previous generation of player DBs has died |
| Older hobby sites (osmhulp, osminfo, osmtactics.weebly, onlinesoccermanagertactic.blogspot) | Live but stale [V] | Tips | 2014–2023 | NL/EN | Minimal | Dead in practice |

Noise: SEO-spam pages about "OSM tactics" sit on hijacked .edu/.gov subdomains and crowd the search results [S].

---

## 6. Extensions, bots and code

- **Browser extensions:** none store-listed on Chrome, Firefox, Greasy Fork or OpenUserJS [V]. Two GitHub-only extensions exist:
  - **OSM-Transfer-Help** ranks transfer-list players by profit using the logged-in session.
  - **shadow-analytics** hooks game traffic and logs market snapshots.
  - Both conflict with the Terms (A.6/A.7).
- **Discord / Telegram:** the official Discord has ~36K members. There are **no OSM bots** on top.gg or discordbotlist and no indexed tactics bots on Telegram [V/S]. Crews share tactics as **WhatsApp screenshots**; one GitHub project even reads those images and applies the tactic.
- **GitHub:** about 20 small repos, 0–7★ [V]:
  - an MCP server that logs in with user credentials
  - league scrapers
  - a "counter PWA" with €2.99–9.99 tiers
  - a Gemini tactic generator
  - an "OSM-based" match engine
  - a **10+ repo cluster of Boss Coin ad-farming bots** (ToS violations)
- **Cheats:** mod-APK and "Boss Coin hack" pages exist, but are less prevalent than for bigger games. The ad-farming bots are the visible abuse [S].

---

## 7. Community and creators

### Hubs

| Hub | Size | Note |
|---|---|---|
| Official Discord | **36,159 members** [V] | English; no bots |
| Official Instagram | ~340K followers [S] | |
| Official YouTube | 17.1K subscribers, **last upload 6 years ago** [V] | The developer leaves the creator space open |
| Official forum, "Tactics Request" thread | 1,296+ pages [S] | Constant demand for counters |
| r/onlinesoccermanager | Not verifiable (Reddit blocked) | |

### YouTube: largest OSM channels [V]

| Channel | Subscribers | Lang | Activity |
|---|---|---|---|
| OSM BEST TACTICS | **39.7K** | EN | Last upload ~6 months ago (280 videos) |
| The King Pekka YT | **33.2K** | EN/ES/ID titles | Monthly; 78K views on a recent video |
| المدرب الافضل Osm | 24.2K | AR | Dormant for 6 years |
| كن محترف | 23K | AR | **Active**; series past episode 1,170 |
| OSM MEJORES TÁCTICAS | 19.7K | ES | Last upload ~6 months ago (611 videos); Spanish twin of OSM BEST TACTICS |
| Hamza Ayaz | 19K | TR | **Weekly**; 7–21K views; runs Telegram tournaments |
| OSM Tactics | 17.5K | FR | Dormant |
| Tuorzeira OSM | 11.2K | PT-BR | ~4 months ago; subscriber cups |
| Alex Demartin | 9.4K | ES (AR) | Active; one video at 97K views; has its own Discord (1,374 members) |
| Barış Onur Aydın | 1.8K | TR | Small channel, but 6–13K views per monthly meta video; "sell a player fast" got 31.8K |

**Pattern:** the biggest channels have gone quiet. Live reach sits with mid-size Turkish, Arabic and LatAm creators, who repost a monthly "meta" with no data behind it. Weekly "OSM unlimited coins mod" scam videos flood YouTube search [V].

### Telegram and social

- **Arab world:** **t.me/osm23_24** has **15,006 subscribers** [V]. It posts tactics, polls and event calendars, linked to @OSM24BOT, and runs ads for coin shops. The Facebook page "OSM – المدرب الافضل" has 22.6K likes [S].
- **Iran:** the community lives on Telegram (OSMGAME 2.9K, Tactics_osm 1.2K) [V].
  - It sells "gem panels" and paid VIP channels.
  - OSMGAME posted a suspension notice on 7 Oct 2026 citing Miniclip/Gamebasics claims [V]. That shows the publisher **does enforce** against grey-market sellers.
- **Italy:** t.me/OSMIT 2.8K [V]. Instagram @osmit_community 5.5K [S].

### By region

| Region | Who leads | Gap |
|---|---|---|
| **Turkey** | Hamza Ayaz, Barış Onur Aydın, OSM NextLevel, oyundunyasi.net (guides updated 25 Oct 2026) | The deepest SEO ecosystem, but no data tools |
| **Egypt / Arab world** | @osm23_24 Telegram, كن محترف, Facebook pages | **No serious Arabic web tool** |
| **Spanish / LatAm** | OSM MEJORES TÁCTICAS (paused), Alex Demartin | Top channel is paused |
| **Brazil** | Tuorzeira OSM | **No strong Brazilian site** |
| **Iran** | Telegram channels | Grey-market heavy |
| **Indonesia** | **Nobody active.** Players drifting to Soccer Manager [S] | Open |
| **Netherlands** | **Nobody active.** Only osmtactics.nl and old blogs, despite being OSM's home market | Open |

### Demand signals

- A forum reply states that "there isn't a database where you can find players specifications" [S].
- Transfer and value videos outperform. For example, 31.8K views for "how to sell a player quickly" and 18.9K for a "transfer trick".
- Creators and guides admit their monthly meta has no measured win rates. oyundunyasi says so, and osmnextlevel calls its pick "not a measured performance ranking" [V].
- Grey-market spending (gem panels, coin shops) proves willingness to pay for an edge.

### Monetisation in the ecosystem

- YouTube ads and sponsorships.
- Donations: Tipeee, Patreon, Buy Me a Coffee.
- Freemium tools: OSM NextLevel Premium, OSM Tactics subscriptions.
- Tournaments and cups for retention.
- Grey-market coin and gem resale. Avoid it: the publisher enforces against it.

---

## 8. Feature gap matrix

✓ = has it, ◐ = partial, ✗ = missing. Data from sections 4–6.

| Feature (fut.gg / futbin analogue) | OSM Helper | OSM Guide / Tactics Assistant | OSM Tactics | OSM Next Level | mgtools | OSM Scout |
|---|---|---|---|---|---|---|
| Counter-tactic engine | ◐ community + AI | ✓ | ✓ | ✓ best | ✗ | ✗ |
| Player DB with Att / Def / Ovr | ◐ single rating | ✓ 40K | ◐ [S] | ✗ | ✓ | ◐ |
| **Indexable per-player pages** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Rating / value history and update "reveals"** | ✗ | ✗ | ✗ | ✗ | ◐ raw log | ✗ |
| **Legends / In-Form / World Star catalogue** | ◐ In-Form tab | ✗ | ✗ | ✗ | ✗ | ✗ |
| Price / value estimator | ✓ scout price | ✓ | ✗ | ◐ quick-sale | ✗ | ✗ |
| Squad / Dream Team builder | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Budget squad builder** (best XI for X money / BC) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Club picker** (compare clubs in a league before signing) | ◐ squad values | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Training / camp / BC calculators** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Crew tools | ✓ | ✗ | ◐ [S] | ✗ | ✗ | ✗ |
| Events calendar | ✓ | ✗ | ✗ | ✗ | ◐ | ✗ |
| Match simulator | ✗ | ◐ tester | ✗ | ✗ | ✗ | ✗ |
| **Outcome-validated tactics** (crowdsourced win rates) | ✗ | ✗ | ✗ | ◐ private journal | ✗ | ✗ |
| **Discord bot** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| iOS + Android + web, all strong | ✗ | ✗ | ◐ | ✗ | ✗ | ◐ |
| Arabic / Turkish / PT / ID first | ✓ 11 langs | ◐ | ✗ EN | ◐ EN/TR | ✗ | ◐ |
| No credentials ever asked | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Bold rows are open ground:** nobody does them at all.

---

## 9. Where a new companion can win

### The data mechanic that changes the futbin playbook

OSM has **no player-to-player auction market**:
- Scouted players cost **value + 15 BC**.
- Sale prices sit inside **0.75×–2.5× value** (see OSM-ANALYSIS §11).

So futbin's market-price tracking does not carry over. What does carry over:
- **value and rating history**
- **update reveals** (who went up or down in the latest ratings patch)
- **rarity catalogues**
- **progression maths**: what a player is worth after N training sessions.

### Positioning

1. **Be the canonical OSM player encyclopedia.**
   - Server-rendered, SEO-indexed pages for every player (Att/Def/Ovr, main stat by line, position, nationality, club, value) with history across the edition's rating updates.
   - In the 21 languages OSM itself ships, starting with **TR, AR, PT-BR, ID, NL, EN**.
   - Nobody indexes this today.
2. **Ship the calculators nobody has built**, all pure maths from the game's verified rules:
   - training progression (50–80% per session below 100 rating, 20–40% above)
   - training-camp escalation (10 → 500 BC)
   - savings interest (2% per match)
   - stadium payback
   - squad-strength badge (best-N per line)
   - a club picker that ranks every club in a league by its badge before you sign
3. **Build the trust differentiator.**
   - Never ask for credentials.
   - Clearly unofficial.
   - Ingest data the fhcwiz way: player-submitted screenshots of squad, scout and Data Analyst screens, read automatically. OSM Next Level already proves Gemini can read OSM screenshots.
4. **Create a tactics data moat.**
   - Let managers log fixture → tactic → result in one tap (screenshot of the result screen).
   - This yields **real win rates per formation, game plan and slider matchup**, plus referee and venue.
   - Every rival's counters are opinion or LLM output. Measured win rates beat them.
5. **Meet crews where they live.**
   - A **Discord bot** (`/counter 4-3-3B away 85v89`, `/player <name>`, battle reminders); there is zero competition here.
   - Share-cards built for WhatsApp.
6. **Pursue official status in parallel.**
   - Request written approval from Gamebasics/Miniclip for data use (Terms A.6).
   - The pitch: a free, login-free companion that drives retention, with no cheats and no currency trading.
   - fut.gg's EA partnership is the precedent.
   - Approval turns the grey zone (ads or subscriptions on OSM content) into a sanctioned business.

### Partnership targets

| Region | Targets | Notes |
|---|---|---|
| **Turkey** | Hamza Ayaz (weekly, 19K); Barış Onur Aydın (high views per subscriber) | |
| **Arab world** | كن محترف (23K, active); @osm23_24 Telegram (15K) | Vet the coin-shop ads first |
| **Multilingual** | The King Pekka YT (33.2K) | |
| **LatAm** | Alex Demartin | Revive the paused OSM BEST TACTICS / MEJORES TÁCTICAS pair (59K combined) |
| **Brazil** | Tuorzeira OSM | |
| **Avoid** | Any coin or gem reseller | |

Creators lack a data feed: the official YouTube has been silent for 6 years. Give them embeddable meta charts and win-rate data, and they become the distribution channel.

### Acquisition option

The revenue leader's iOS app is listed at **$22K** (Flippa) and the same app at $25K elsewhere [V/S]. Buying an existing subscriber base, ~94 subs and 100K+ Android installs, is a realistic shortcut, but due diligence must cover how it sources its data.

---

## 10. Sources

### Reference products
- fut.gg: https://www.fut.gg/
- fhcwiz.com: https://fhcwiz.com/

### Terms
- OSM Terms & Conditions: https://www.onlinesoccermanager.com/TermsAndConditions

### Apps
- OSM Guide: https://play.google.com/store/apps/details?id=com.rachidhilmi.appbasics.osmguide
- OSM Tactics:
  - Android: https://play.google.com/store/apps/details?id=com.osmguide
  - iOS: https://apps.apple.com/us/app/osm-tactics/id1632773385
- OSM Helper: https://play.google.com/store/apps/details?id=com.TeknoRed.OSMCoach
- OSM Scout:
  - Android: https://play.google.com/store/apps/details?id=com.stasinato.osm_scouting_list
  - iOS: https://apps.apple.com/us/app/osm-scout/id1644349096
- Osm Counter Tactics: https://play.google.com/store/apps/details?id=com.utku.osmkartaktikleri
- OSM Scouting: https://play.google.com/store/apps/details?id=com.doonstein.osmscouting

### Revenue and sale listings
- TrustMRR, OSM Tactics: https://trustmrr.com/startup/osm-tactics
- Flippa listing: https://flippa.com/14398592

### Websites
- https://osmhelper.com
- https://www.osmnextlevel.com
- https://osmtacticsassistant.com
- https://mgtools.cloud/games/osm
- https://osmsim.com
- https://osmcoach.com
- https://osmtactic.com
- https://osmguide.com
- https://osmhispano.blogspot.com

### Code
- https://github.com/SPOFETA/OSM-Transfer-Help
- https://github.com/Peterz15/shadow-analytics
- https://github.com/stgo32/osm-mcp
- https://github.com/jordinoort4-lang/osm-counter-pwa
- https://github.com/Doonstein2004/OSMLineup

### Community
- Official Discord: https://discord.com/servers/osm-421623127869751306
- YouTube channels:
  - https://www.youtube.com/@osmbesttactics
  - https://www.youtube.com/@osmmejorestacticas
  - https://www.youtube.com/@TheKingPekkaYT
  - https://www.youtube.com/@hamzaayazz
  - https://www.youtube.com/@TuorzeiraOSM
  - https://www.youtube.com/@AlexDemartinOSM
- Telegram:
  - https://t.me/osm23_24
  - https://t.me/osmgameee
  - https://t.me/OSMIT
- Turkish guides: https://www.oyundunyasi.net/oyun-rehberi/osm-en-iyi-taktik/
