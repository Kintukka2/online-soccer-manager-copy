(function (OSM) {
  'use strict';

  // The game's rules, and only rules that were read or measured. Every value
  // carries where it came from, because two kinds sit side by side here and
  // a reader of this file has to be able to tell them apart:
  //
  //   V  verified: read from the OSM web client (enums.js, osm.js, lineup.js,
  //      build v32583) or an official Gamebasics page.
  //   C  community: forum moderators, guides and player measurements. Shown in
  //      the app as such and never presented as the game's own number.
  //
  // docs/OSM-ANALYSIS.md has the long form of every rule, with sources.

  // The four lines and the stat that counts for each. V: osm.js picks statAtt
  // for attackers, statOvr for midfielders and statDef for everyone else.
  var LINES = [
    { key: 'G', name: 'Goalkeeper', plural: 'Goalkeepers', short: 'Kee', stat: 'def' },
    { key: 'D', name: 'Defender', plural: 'Defenders', short: 'Def', stat: 'def' },
    { key: 'M', name: 'Midfielder', plural: 'Midfielders', short: 'Mid', stat: 'ovr' },
    { key: 'A', name: 'Forward', plural: 'Forwards', short: 'Att', stat: 'att' }
  ];

  // The twelve specific positions. V: PlayerSpecificPosition in enums.js.
  var POSITIONS = [
    { abbr: 'GK', name: 'Goalkeeper', line: 'G' },
    { abbr: 'CB', name: 'Centre-back', line: 'D' },
    { abbr: 'LB', name: 'Left-back', line: 'D' },
    { abbr: 'RB', name: 'Right-back', line: 'D' },
    { abbr: 'CDM', name: 'Defensive midfielder', line: 'M' },
    { abbr: 'CM', name: 'Central midfielder', line: 'M' },
    { abbr: 'CAM', name: 'Attacking midfielder', line: 'M' },
    { abbr: 'LM', name: 'Left midfielder', line: 'M' },
    { abbr: 'RM', name: 'Right midfielder', line: 'M' },
    { abbr: 'ST', name: 'Striker', line: 'A' },
    { abbr: 'LF', name: 'Left forward', line: 'A' },
    { abbr: 'RF', name: 'Right forward', line: 'A' }
  ];

  // Twelve shapes, each with an A and a B variant. V: the formation code's
  // digits are defenders, midfielders, forwards (getPlayerAmountForPosition
  // in lineup.js), and the variants share their counts, so they share a
  // strength. Midfield layouts are listed only where the client draws them;
  // the other five shapes are known to have both variants and no more.
  var FORMATIONS = [
    { code: '433', name: '4-3-3', mid: { A: ['CM', 'CAM', 'CM'], B: ['CM', 'CDM', 'CM'] } },
    { code: '442', name: '4-4-2', mid: { A: ['LM', 'CM', 'CM', 'RM'], B: ['CDM', 'CM', 'CM', 'CAM'] } },
    { code: '451', name: '4-5-1', mid: { A: ['LM', 'CM', 'CDM', 'CM', 'RM'], B: ['LM', 'CM', 'CAM', 'CM', 'RM'] } },
    { code: '424', name: '4-2-4', mid: { A: ['CM', 'CM'], B: ['CDM', 'CDM'] } },
    { code: '343', name: '3-4-3', mid: null },
    { code: '352', name: '3-5-2', mid: { A: ['LM', 'CAM', 'CDM', 'CAM', 'RM'], B: ['LM', 'CDM', 'CM', 'CDM', 'RM'] } },
    { code: '334', name: '3-3-4', mid: null },
    { code: '325', name: '3-2-5', mid: { A: ['CDM', 'CDM'], B: ['CDM', 'CDM'] } },
    { code: '523', name: '5-2-3', mid: null },
    { code: '532', name: '5-3-2', mid: { A: ['CM', 'CAM', 'CM'], B: ['CAM', 'CM', 'CAM'] } },
    { code: '541', name: '5-4-1', mid: null },
    { code: '631', name: '6-3-1', mid: null }
  ];

  // V: TacticOverall. The label is what the game prints; the key is the
  // client's own name for it.
  var GAME_PLANS = [
    { key: 'LongBall', name: 'Long ball' },
    { key: 'PassingGame', name: 'Passing game' },
    { key: 'PlayWide', name: 'Wing play' },
    { key: 'CounterAttack', name: 'Counter attack' },
    { key: 'ShootOnSight', name: 'Shoot on sight' }
  ];

  // V: TacticStyleOfPlay, Fair / Normal / Hard / Extreme in the client.
  var TACKLING = [
    { key: 'Fair', name: 'Careful' },
    { key: 'Normal', name: 'Normal' },
    { key: 'Hard', name: 'Aggressive' },
    { key: 'Extreme', name: 'Reckless' }
  ];

  // V: TacticLineAtt / TacticLineMid / TacticLineDef. Labels as printed.
  var LINE_TACTICS = {
    forwards: ['Drop deep', 'Support midfield', 'Attack only'],
    midfielders: ['Protect the defence', 'Stay in position', 'Push forward'],
    defenders: ['Defend deep', 'Attacking full-backs', 'Support midfield']
  };

  var MARKING = ['Zonal', 'Man-to-man'];

  // V: RefereeStrictness, strictest first.
  var REFEREES = ['Very strict', 'Strict', 'Average', 'Lenient', 'Very lenient'];

  // V: getLineupStrengthCircleColor in lineup.js. Checked top down.
  var TIERS = [
    { name: 'gold', min: 100 },
    { name: 'silver', min: 90 },
    { name: 'bronze', min: 80 },
    { name: 'blue', min: 0 }
  ];

  // C: the pairings most guides agree on. Shown as community wisdom.
  var PAIRINGS = [
    { plan: 'LongBall', formations: ['424', '334', '325', '523'], against: 'A dominant midfield' },
    { plan: 'PassingGame', formations: ['442', '352', '451'], against: 'Equal or weaker sides' },
    { plan: 'PlayWide', formations: ['433', '343'], against: 'Almost everything in 26/27' },
    { plan: 'CounterAttack', formations: ['631', '541', '532', '523'], against: 'Stronger or attacking opponents' },
    { plan: 'ShootOnSight', formations: ['451', '541'], against: 'Deep, compact defences' }
  ];

  // C: slider ranges from October 2026 guides, as pressing / style / tempo.
  var META = [
    { situation: 'You are stronger', setup: '4-3-3 A or B, Wing play', sliders: '65–68 / 65–72 / 54–65' },
    { situation: 'Even game', setup: '4-5-1 B, Shoot on sight', sliders: '55 / 52 / 58' },
    { situation: 'Much weaker, away', setup: '4-5-1 or 5-3-2, Counter attack', sliders: '38 / 35 / 72' }
  ];

  OSM.data = {
    VERSION: '0.1.0',

    LINES: LINES,
    POSITIONS: POSITIONS,
    FORMATIONS: FORMATIONS,
    VARIANTS: ['A', 'B'],
    GAME_PLANS: GAME_PLANS,
    TACKLING: TACKLING,
    LINE_TACTICS: LINE_TACTICS,
    MARKING: MARKING,
    REFEREES: REFEREES,
    TIERS: TIERS,
    PAIRINGS: PAIRINGS,
    META: META,

    // C: training. A session runs 8 hours; a full bar is one rating point.
    // Gains are a share of a bar per session, by the player's rating.
    TRAINING: {
      sessionHours: 8,
      gainBelow100: [0.5, 0.8],
      gainFrom100: [0.2, 0.4],
      facility: [0, 0.10, 0.25, 0.50]
    },

    // C: Training Camp costs by the order it is bought in a league, six at
    // most. The boost itself is a moderator's figure.
    CAMP: { costs: [10, 20, 50, 100, 200, 500], boost: 0.25 },

    // C, moderator: savings earn 2% per match, paid only on what sits in
    // Savings when the match is simulated.
    SAVINGS_RATE: 0.02,

    // C: what a manager may ask for a listed player, as multiples of value.
    SALE_BAND: { min: 0.75, max: 2.5 },

    // V: manager slots unlock this many days after sign-up (osm.js).
    SLOT_UNLOCK_DAYS: [0, 5, 20, 50]
  };

  // Lookups built once.
  var lineByPosition = {};
  POSITIONS.forEach(function (p) { lineByPosition[p.abbr] = p.line; });
  var lineByKey = {};
  LINES.forEach(function (l) { lineByKey[l.key] = l; });
  var formationByCode = {};
  FORMATIONS.forEach(function (f) { formationByCode[f.code] = f; });
  var planByKey = {};
  GAME_PLANS.forEach(function (g) { planByKey[g.key] = g; });

  OSM.data.lineOf = function (position) { return lineByPosition[position] || null; };
  OSM.data.line = function (key) { return lineByKey[key] || null; };
  OSM.data.formation = function (code) { return formationByCode[code] || null; };
  OSM.data.plan = function (key) { return planByKey[key] || null; };
})(window.OSM = window.OSM || {});
