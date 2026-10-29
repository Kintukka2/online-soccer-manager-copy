# OSMWiz Visual System: Evidence

Every value in [`OSMWiz_Visual_System.html`](OSMWiz_Visual_System.html), [`tokens.css`](tokens.css) and [`tokens.json`](tokens.json) traces back to this file.

Research snapshot: **29 October 2026**, Online Soccer Manager 26/27, app 4.14.48, web client build v32583.

## Sources

| Source | Images | Notes |
|---|---|---|
| App Store, current art (OSM-300/324) | 14 | 7 screens at 2796×1290 (iPhone) and 2732×2048 (iPad). The set is identical in 17 storefronts (us, gb, nl, tr, br, id, de, fr, it, sa, eg, ru, pl, in, th, gr, ma). |
| App Store, previous art (OSM-170/191) | 8 | 2688×1242, still served in the ar, es and mx storefronts. Used only to date what 26/27 changed. |
| Google Play | 17 | 7 phone (2208×1242) and 7 tablet (2732×2048) screens matching the App Store set, the 26/27 icon, the Arabic "المدرب الأفضل" icon, and the Halloween 2026 "Scary Switchers" feature graphic (1920×1080). |
| Web client | 2 + styles | The privacy gate at 1440×900 and 412×915. Computed styles were read in the browser, and the public stylesheet `osm.cloud/sb/osm-style.css.v32583` was read without signing in and without accepting the Terms. |

All App Store images were pulled through the public iTunes Lookup API (`itunes.apple.com/lookup?id=400201466&country=…`) at native resolution. Play images came from the public listing at original size.

**None of these images is committed.** They are Gamebasics' copyright. [`measure/fetch_shots.sh`](measure/fetch_shots.sh) re-downloads them locally.

## What the web client confirmed (Verified)

| Fact | Value | Where |
|---|---|---|
| Typeface | `"Saira Condensed", "Sofia Sans Condensed", sans-serif`. Google Fonts load weights 400/500/700/800, and the body is set at 300. | `document.fonts`, computed `font-family` |
| Default button | `#00A8FF`, hover `#359CFF`. Radius 6px, height 45px, 21px weight-800 label. | `.btn-new` |
| Button bevel | `inset 0 -4px 0 -2px rgba(0,0,0,.4), inset 0 4px 1px -2px rgba(255,255,255,.4)` | `.btn-new` |
| Gloss band | `::after` at top 4px, left and right 8px, height `calc(50% - 4px)`, `rgba(255,255,255,.4)`, plus `inset 0 11px 27px 7px <button colour>` | `.btn-new:after` |
| Variants | orange `#FC8C21`/`#EC781E` · success `#16B800`/`#3FC933` · dark-blue `#061C2B`/`#082032` · alternative-blue `#154B96`/`#0C3D7F` · danger `#D9534F`/`#C9302C` · Facebook `#064BCA` | `.btn-new.btn-*` |
| Disabled | Fill and gloss glow both `#B3B3B3` | `.btn-new:disabled` |
| Selection | `#04335A` → `#062C4C`, label `#FFE800` | `.btn-new.btn-selectable.active-btn` |
| Dialog | `rgba(0,0,0,.45)`, radius 15px, inset rims `rgba(47,109,146,.9)` | `.privacynotice-container` |
| Link | `#5AC8FA`, weight 500 | `.open-modal-link` |
| Card themes | Per-theme image through `--theme-image-url` (`lineupcard_default.png`, `playercard_default_large.png`, `minicard_default.png`) | stylesheet custom properties |
| Strength tiers | blue < 80, bronze ≥ 80, silver ≥ 90, gold ≥ 100 | `getLineupStrengthCircleColor` in `lineup.js` |

## Method (Measured)

- Each region is a rectangle in 1400-px-wide view coordinates, scaled to native resolution. Every region file is in `measure/`.
- Each region reports:
  - its **median**;
  - the mean of its brightest 5% and darkest 5% (`hi` / `lo`), which gives glyph and rim cores free of anti-aliasing;
  - a **median-cut** quantisation into 2–5 clusters with their share.
- Store art is polished marketing composite, so a value seen only there is tagged *Measured*. A value the web client confirms is tagged *Verified*. A stop the game never renders is tagged *Derived*:
  - bronze and blue tier rings;
  - the L form chip;
  - the amber low-fitness bar.
- To reproduce:
  ```
  bash docs/brand/measure/fetch_shots.sh shots
  for i in 1 2 3 4; do python3 docs/brand/measure/sample.py shots docs/brand/measure/regions$i.json; done
  ```
  The output matched the published values byte for byte on 29 Oct 2026.

## Not covered

These screens appear in no store art, so nothing on them is measured:
- transfer list
- finances
- stadium
- scout
- doctor and lawyer
- crews
- divisions list
- settings

Screenshots from a real device would extend the system to them using the same method.

## Measurements (110 regions)

| Region | Source | Median | Clusters (share, colour) |
|---|---|---|---|
| `topbar` | OSM-300_Line_up | `#01243D` | 30% #022B4D · 27% #011F35 · 22% #022743 · 22% #011D30 |
| `topbar_hairline` | OSM-300_Line_up | `#D3B282` | 42% #DFC091 · 35% #A2855F · 23% #F2E6CA |
| `pill_clubfunds` | OSM-300_Line_up | `#6DC3FF` | 27% #77C8FF · 26% #92D2FF · 26% #5BBBFB · 21% #263850 |
| `pill_bosscoin` | OSM-300_Line_up | `#71C4FF` | 32% #77C8FF · 26% #5FBCFE · 22% #95D6FF · 20% #254768 |
| `tab_menu_light` | OSM-300_Line_up | `#DCE0F2` | 32% #D8DBED · 31% #E5EAFA · 19% #BFC9DC · 18% #DDE8F9 |
| `empty_slot` | OSM-300_Line_up | `#152937` | 27% #1A2F3E · 26% #06192C · 25% #0F2233 · 23% #2A414F |
| `plus_circle` | OSM-300_Line_up | `#142332` | 43% #142332 · 36% #122131 · 18% #364759 · 3% #0C1C2B |
| `card_rating_text` | OSM-300_Line_up | `#63605C` | 50% #112236 · 46% #E4C197 · 4% #B29C80 |
| `card_body` | OSM-300_Line_up | `#11212F` | 39% #152332 · 29% #0F1E2E · 19% #091525 · 13% #6D5F52 |
| `pitch` | OSM-300_Line_up | `#224F15` | 47% #235116 · 27% #1F4C13 · 18% #1B4610 · 8% #346127 |
| `side_icon_btn` | OSM-300_Line_up | `#082239` | 51% #082238 · 23% #E7EAEC · 17% #041E35 · 8% #0E2C46 |
| `side_label_pill` | OSM-300_Line_up | `#001C31` | 58% #001C31 · 24% #899AA7 · 10% #031C33 · 8% #00162C |
| `formation_pill` | OSM-300_Line_up | `#001C31` | 83% #001C31 · 11% #64859F · 4% #00172D · 2% #001C30 |
| `bench_panel` | OSM-300_Line_up | `#0B4169` | 28% #0C466F · 26% #0A3F67 · 25% #0B426A · 21% #093B62 |
| `table_head_blue` | OSM-300_Ultimate_team | `#0096E3` | 89% #0096E3 · 5% #BCE2F7 · 3% #0098E3 · 3% #008CE1 |
| `table_row_white` | OSM-300_Ultimate_team | `#FFFFFF` | 100% #FFFFFF |
| `table_row_star` | OSM-300_Ultimate_team | `#FFF8E5` | 100% #FFF8E5 |
| `fit_bar` | OSM-300_Ultimate_team | `#66EE2D` | 75% #50F12E · 25% #89EE58 |
| `team_circle` | OSM-300_Ultimate_team | `#003B53` | 38% #0A3E55 · 34% #003248 · 24% #5ABFCD · 4% #232E3B |
| `line_circle` | OSM-300_Ultimate_team | `#003C52` | 41% #003950 · 25% #47C8D1 · 17% #002A40 · 16% #0A6155 |
| `info_strip` | OSM-300_Ultimate_team | `#005C7F` | 46% #026189 · 44% #004F71 · 9% #477F95 · 1% #364150 |
| `panel_sky` | OSM-300_Ultimate_team | `#10A1EA` | 43% #00B6EE · 22% #1C97E6 · 19% #2586D2 · 16% #2EA9E9 |
| `page_royal` | OSM-300_Upgrade | `#022F6D` | 32% #022D6A · 29% #02306E · 25% #043473 · 14% #032C66 |
| `coach_card` | OSM-300_Upgrade | `#092E4C` | 34% #0A2B46 · 28% #0C3456 · 20% #82807B · 18% #072139 |
| `coach_card_univ` | OSM-300_Upgrade | `#060B30` | 71% #060B30 · 14% #5B504B · 10% #050826 · 5% #040B1C |
| `progress_fill` | OSM-300_Upgrade | `#00FA33` | 95% #00FA33 · 5% #048534 |
| `progress_track` | OSM-300_Upgrade | `#001A2E` | 77% #00182C · 23% #072034 |
| `claim_btn` | OSM-300_Upgrade | `#B1EAFF` | 41% #B4EDFF · 27% #D4FBFF · 21% #10224A · 12% #9CD3F2 |
| `claim_btn_text` | OSM-300_Upgrade | `#99CCDC` | 45% #1E3459 · 30% #AFE7FB · 25% #D1FAFD |
| `shield_frame` | OSM-300_Upgrade | `#5B4343` | 27% #DDBE96 · 27% #222233 · 25% #3D3843 · 22% #7F5748 |
| `vs_panel_head` | OSM-300_Strategy | `#20587E` | 45% #22597E · 24% #144B7D · 17% #1A537E · 14% #266183 |
| `vs_gold` | OSM-300_Strategy | `#C8A568` | 41% #134C6F · 32% #CFAF43 · 22% #EEE164 · 4% #346575 |
| `cyan_ring` | OSM-300_Strategy | `#052536` | 40% #042333 · 25% #5BA7B8 · 18% #0C3751 · 16% #031D2B |
| `next_match_tab` | OSM-300_Strategy | `#020E18` | 37% #020D17 · 35% #020F19 · 20% #316177 · 9% #02070D |
| `strip_dark` | OSM-300_Strategy | `#020D17` | 100% #020D17 |
| `chip_W` | OSM-300_Strategy | `#195610` | 49% #19560F · 22% #0E3014 · 17% #446345 · 12% #17560E |
| `chip_D` | OSM-300_Strategy | `#B37607` | 59% #B37608 · 17% #1F1B13 · 14% #B38F46 · 10% #A86D09 |
| `tactic_card` | OSM-300_Strategy | `#002037` | 100% #002037 |
| `label_cyan` | OSM-300_Strategy | `#052037` | 52% #022138 · 32% #4BA8CD · 16% #041626 |
| `help_q` | OSM-300_Strategy | `#00BBFD` | 64% #00BBFE · 17% #0299D2 · 11% #A8E8FA · 8% #00C0FE |
| `page_royal2` | OSM-300_Strategy | `#00165D` | 43% #00165E · 37% #00155C · 20% #00165D · 0% #183D6A |
| `red_arrow` | OSM-300_Strategy | `#F43E17` | 38% #FC3018 · 34% #6F4412 · 28% #FF4331 |
| `scoreboard` | OSM-300_Match_Exp | `#0A1A2D` | 100% #0A1A2D |
| `minute_bubble` | OSM-300_Match_Exp | `#0A1A2D` | 61% #0A1A2D · 27% #427199 · 9% #090E1A · 3% #091A2D |
| `event_pill` | OSM-300_Match_Exp | `#07243F` | 52% #07243F · 46% #0A1A2D · 1% #08253C · 1% #072441 |
| `goal_text` | OSM-300_Match_Exp | `#0D496F` | 33% #10507A · 21% #081829 · 20% #114263 · 18% #1776AB · 8% #083151 |
| `missed_x` | OSM-300_Match_Exp | `#00C3C4` | 47% #00C7C8 · 31% #065866 · 22% #01DEDE |
| `division_shield` | OSM-300_Rise | `#8E96A0` | 28% #595959 · 25% #97A499 · 21% #727D8C · 16% #BDBCBC · 10% #EDEDED |
| `division_bar` | OSM-300_Rise | `#16DE00` | 51% #0ED305 · 49% #1DF200 |
| `card_olise_purple` | OSM-324_Cards | `#CB7A92` | 37% #9952AA · 37% #CD7E85 · 26% #D08A7C |
| `card_uzun_green` | OSM-324_Cards | `#BEDCD3` | 43% #C0E7DC · 30% #849E8E · 27% #DAEEE8 |
| `card_courtois_violet` | OSM-324_Cards | `#D955FE` | 57% #DB57FE · 28% #A13BF8 · 15% #EB76FB |
| `card_haaland_navygold` | OSM-324_Cards | `#28243E` | 62% #171B32 · 29% #D1DBF1 · 9% #4D484D |
| `card_schlotterbeck_navy` | OSM-324_Cards | `#1B223C` | 47% #151B32 · 32% #262636 · 21% #A2A6B3 |
| `card_bellingham_navygold` | OSM-324_Cards | `#34304D` | 54% #1E2540 · 27% #CFD9E9 · 19% #504447 |
| `card_dias_green` | OSM-324_Cards | `#0D4335` | 45% #054537 · 32% #103A2E · 23% #96C3B9 |
| `card_schick_orange` | OSM-324_Cards | `#CA8423` | 72% #CA8423 · 20% #CCA05F · 8% #C07A21 |
| `card_cherki_blue` | OSM-324_Cards | `#053A60` | 51% #05233C · 25% #025C87 · 23% #A2C7DA |
| `card_valverde_blackgold` | OSM-324_Cards | `#292113` | 57% #2B2313 · 34% #1F1A12 · 9% #4C3D1F |
| `card_foden_blackgold` | OSM-324_Cards | `#2A2213` | 55% #2D2413 · 34% #1E1912 · 11% #5A4926 |
| `card_mbappe_navygold` | OSM-324_Cards | `#292538` | 47% #181C32 · 34% #342A30 · 19% #A5A3AB |
| `card_donnarumma_violet` | OSM-324_Cards | `#6A32FF` | 44% #6335FF · 35% #5B2BFC · 20% #B85DFB |
| `card_cucurella_crimson` | OSM-324_Cards | `#1F195F` | 46% #1E1659 · 37% #1D1A62 · 17% #7C79B7 |
| `card_stiller_blue` | OSM-324_Cards | `#4E55EE` | 44% #4156EC · 39% #404EEA · 16% #92A9EF |
| `card_doku_teal` | OSM-324_Cards | `#06376A` | 46% #052E55 · 30% #073C76 · 25% #0A4B91 |
| `card_oreilly_crimson` | OSM-324_Cards | `#1E185B` | 68% #1E185C · 23% #1E1554 · 9% #28236A |
| `card_romulo_gold` | OSM-324_Cards | `#F1E5A0` | 43% #F2E8A6 · 33% #E6D38A · 24% #F7F1BA |
| `card_semenyo_green` | OSM-324_Cards | `#00463E` | 40% #00473F · 35% #02403A · 25% #0E675C |
| `card_kane_blue` | OSM-324_Cards | `#3E6FB1` | 42% #3D5EAD · 30% #417EB5 · 28% #4275B3 |
| `card_silva_green` | OSM-324_Cards | `#025A32` | 49% #023127 · 28% #026338 · 23% #04753F |
| `card_fullkrug_teal` | OSM-324_Cards | `#008EB5` | 43% #014D71 · 39% #00ACCC · 18% #67D1E1 |
| `card_vini_blue` | OSM-324_Cards | `#3F68AF` | 44% #3E58AB · 33% #436FB1 · 23% #4780B6 |
| `card_tchouameni_goldwhite` | OSM-324_Cards | `#A5D6EC` | 40% #94CFEB · 32% #AAD9EC · 28% #BADFEA |
| `collect_bg` | OSM-324_Cards | `#303738` | 56% #1D232F · 27% #D5C169 · 17% #575544 |
| `collect_70k_gold` | OSM-324_Cards | `#164551` | 30% #FDE9B2 · 29% #0B2439 · 24% #0F2E47 · 17% #D3B172 |
| `collect_text_white` | OSM-324_Cards | `#123958` | 52% #0B2438 · 46% #FFFFFF · 2% #6A7E8F |
| `icon_osm_letters` | icon_en | `#000000` | 100% #000000 |
| `icon_2627_gold` | icon_en | `#000000` | 100% #000000 |
| `icon_osm_letters` | icon_en | `#EC692D` | 29% #E93323 · 26% #ED8537 · 25% #F6F2F0 · 14% #E74B28 · 7% #E43022 |
| `icon_2627_gold` | icon_en | `#88754F` | 27% #AB8F63 · 25% #DCC293 · 25% #282E28 · 24% #555746 |
| `icon_ball_navy` | icon_en | `#9899A5` | 41% #A0A1B5 · 32% #0A070D · 16% #A6ACC0 · 11% #6C4947 |
| `ring_edge_vs` | OSM-300_Strategy | `#1C849B` | 41% #09313F · 38% #1E89A0 · 21% #49B9C6 |
| `ring_edge_minute` | OSM-300_Match_Exp | `#09213A` | 55% #0A1627 · 36% #009BFC · 10% #0467B4 |
| `web_accept` | privacy_gate_1440 | `#FF8C33` | 67% #FE8C2B · 20% #77534F · 13% #FEA153 |
| `web_panel` | privacy_gate_1440 | `#1F2B51` | 43% #232F54 · 39% #192448 · 17% #4D4F5D |
| `web_link` | privacy_gate_1440 | `#181D32` | 54% #181D31 · 33% #171B30 · 14% #263E57 |
| `web_logo_gold` | privacy_gate_1440 | `#BB8B5F` | 36% #AC7D46 · 20% #D0A36F · 17% #4D4E51 · 15% #FFFDED · 11% #ECEADF |
| `web_bg_top` | privacy_gate_1440 | `#0A1F45` | 53% #04173A · 26% #152C54 · 21% #3F5C83 |
| `lineup_frame_bottom` | OSM-300_Line_up | `#CBC3A0` | 33% #F3F2F7 · 32% #0A1B2A · 20% #DEDBD7 · 15% #787460 |
| `lineup_frame_right` | OSM-300_Line_up | `#9A8063` | 36% #AE9572 · 28% #151320 · 19% #D8C8A9 · 17% #634F3F |
| `lineup_marble_corner` | OSM-300_Line_up | `#D6DCF0` | 33% #CAD2E4 · 26% #D8E4F7 · 26% #EAEEF8 · 14% #707D98 |
| `lineup_streak` | OSM-300_Line_up | `#101E29` | 36% #12202D · 23% #0B1A27 · 21% #0E1A26 · 20% #362D2B |
| `lineup_pos_text` | OSM-300_Line_up | `#9F8D77` | 48% #112336 · 47% #E4C197 · 5% #C8AC8A |
| `vs_head_top` | OSM-300_Strategy | `#144C84` | 66% #134B84 · 34% #164F84 |
| `vs_head_bottom` | OSM-300_Strategy | `#285D7D` | 55% #2A5F7E · 45% #255A7C |
| `vs_panel_rim` | OSM-300_Strategy | `#0F3B59` | 50% #0F3B59 · 33% #113751 · 17% #085C90 |
| `tactic_card_rim` | OSM-300_Strategy | `#58859C` | 41% #5A93AA · 32% #2E5065 · 26% #69B1C5 |
| `value_white` | OSM-300_Strategy | `#052138` | 59% #011B30 · 31% #FCFDFD · 10% #596975 |
| `coach_title` | OSM-300_Upgrade | `#7C8B97` | 49% #132B41 · 36% #FFFFFF · 15% #C6CCD1 |
| `coach_name_gold` | OSM-300_Upgrade | `#9C927D` | 48% #26373E · 42% #EFD1AC · 10% #D6BD9E |
| `coach_card_top` | OSM-300_Upgrade | `#021E35` | 100% #021E35 |
| `coach_card_bottom` | OSM-300_Upgrade | `#02192C` | 60% #021B30 · 40% #021728 |
| `claim_btn_top` | OSM-300_Upgrade | `#C0F3FF` | 62% #B6EFFF · 38% #DDFCFF |
| `claim_btn_bottom` | OSM-300_Upgrade | `#B1EAFF` | 76% #B3ECFF · 24% #99D6FB |
| `pill_coin_silver` | OSM-300_Line_up | `#E3E3E2` | 38% #DEDEDE · 26% #E9E9E9 · 22% #F6F6F6 · 14% #B7BBBE |
| `bosscoin_icon` | OSM-300_Line_up | `#D7CD36` | 50% #FFEE2C · 29% #75DBAF · 17% #2E555E · 4% #80BF88 |
| `star_badge` | OSM-300_Ultimate_team | `#F2B425` | 57% #E5A523 · 39% #FFFCF0 · 5% #F1D279 |
| `jersey_blue` | OSM-300_Ultimate_team | `#2A4B99` | 60% #2A4B99 · 29% #A9ACBD · 12% #193B8E |
| `table_text_dim` | OSM-300_Ultimate_team | `#FFF8E5` | 90% #FFF9E6 · 10% #C3C1B8 |
| `table_text_bold` | OSM-300_Ultimate_team | `#FFF8E5` | 77% #FFF9E8 · 23% #6E6B65 |

## App Store image inventory

| Image | Storefronts |
|---|---|
| `OSM-191_Managers_in_store_art_MCI_RMA-No_Bar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_02_Ultimate_team-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_01_Official-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_05_Line-up-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_03_Upgrade-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_06_Strategy-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_04_Match_Exp-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-170_Store_Art_update_07_Rise_to_the_top-NoBar_2688x1242_en-GB.png` | 3 (ar, es, mx) · iphone |
| `OSM-324_Cards_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-300_Line_up_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-300_Ultimate_team_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-300_Upgrade_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-300_Strategy_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-300_Match_Exp_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-300_Rise_2732x2048px_en-GB.png` | 20 (ar, br, de, eg, es, fr…) · ipad |
| `OSM-324_Cards_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
| `OSM-300_Line_up_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
| `OSM-300_Ultimate_team_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
| `OSM-300_Upgrade_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
| `OSM-300_Strategy_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
| `OSM-300_Match_Exp_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
| `OSM-300_Rise_2796x1290px_en-GB.png` | 17 (br, de, eg, fr, gb, gr…) · iphone |
