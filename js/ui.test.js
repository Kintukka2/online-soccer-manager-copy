(function (OSM) {
  'use strict';

  var t = OSM.t, test = t.test, eq = t.eq, ok = t.ok, count = t.count;
  var ui = OSM.ui;

  function state(players) {
    var s = OSM.store._fresh();
    if (players) { s.squad.players = players; s.squad.example = false; }
    return s;
  }

  /* ---- the board ---- */

  test('a formation board carries eleven of our magnets', function () {
    OSM.data.FORMATIONS.forEach(function (f) {
      var svg = OSM.board.formation(f.code, 'A');
      eq(count(svg, 'fill="#FF3D7F"'), 11, f.name);
    });
  });

  test('midfield codes print where the layout is known, and nowhere else', function () {
    var svg = OSM.board.formation('433', 'B');
    eq(count(svg, '>CDM<'), 1, '4-3-3 B has one CDM');
    eq(count(svg, '>CM<'), 2, 'and two CM');
    eq(count(OSM.board.formation('343', 'A'), '<text'), 0, '3-4-3 has no known layout');
  });

  test('a board never prints a rating', function () {
    var svg = OSM.board.formation('442', 'A');
    ok(!/>\d+</.test(svg), 'no number between tags');
  });

  test('the empty board parks five of ours and five of theirs', function () {
    var svg = OSM.board.empty();
    eq(count(svg, 'fill="#FF3D7F"'), 5, 'ours');
    eq(count(svg, 'fill="#13233A"'), 5, 'theirs');
  });

  /* ---- pages ---- */

  test('the squad page shows the strength the engine works out', function () {
    var html = ui.squad(state());
    ok(html.indexOf('<small>Team</small>86') !== -1, 'team badge reads 86 for the example in 4-3-3');
    ok(html.indexOf('t-bronze') !== -1, 'bronze ring');
    ok(html.indexOf('Example squad') !== -1, 'example is labelled');
  });

  test('the squad page warns when a formation cannot be filled', function () {
    var html = ui.squad(state([{ id: 'a', name: 'One', position: 'GK', att: 1, def: 80 }]));
    ok(html.indexOf('Not enough defenders or midfielders or forwards') !== -1, 'short lines named');
  });

  test('an empty squad offers the example back', function () {
    var html = ui.squad(state([]));
    ok(html.indexOf('data-action="load-example"') !== -1, 'load example');
    ok(html.indexOf('<small>Team</small>0') !== -1, 'strength 0');
    ok(html.indexOf('data-action="pick-formation"') === -1, 'no ranking of an empty squad');
  });

  test('every page renders without throwing', function () {
    var s = state();
    ['home', 'squad', 'tactics', 'calculators', 'matchLog', 'about'].forEach(function (name) {
      var html = ui[name](s);
      ok(typeof html === 'string' && html.length > 200, name);
    });
  });

  test('the tactics page lists all twelve shapes', function () {
    var html = ui.tactics();
    OSM.data.FORMATIONS.forEach(function (f) { ok(html.indexOf('<b>' + f.name + '</b>') !== -1, f.name); });
  });

  test('every community figure is labelled as one', function () {
    var html = ui.calculators();
    eq(count(html, 'Community figure'), 4, 'camp, savings, training, asking price');
    eq(count(html, 'Game rule'), 1, 'level-up');
  });

  test('calculator answers', function () {
    ok(ui.calcOut.camp({ bought: 2 }).indexOf('50 BC') !== -1, 'third camp costs 50');
    ok(ui.calcOut.camp({ bought: 6 }).indexOf('All six used') !== -1, 'all used');
    ok(ui.calcOut.savings({ balance: '1M', matches: 2 }).indexOf('1M') !== -1, 'savings prints money');
    ok(ui.calcOut.savings({ balance: 'lots', matches: 2 }).indexOf('class="warn"') !== -1, 'bad money warns');
    ok(ui.calcOut.training({ from: 88, to: 92, facility: 0 }).indexOf('5 to 8 sessions') !== -1, 'training range');
    ok(ui.calcOut.training({ from: 92, to: 88 }).indexOf('above') !== -1, 'target below now');
    ok(ui.calcOut.sale({ value: '20M' }).indexOf('15M to 50M') !== -1, 'asking band');
    ok(ui.calcOut.levelup({ position: 'CM', att: 80, def: 76 }).indexOf('81 / 77 / 79') !== -1, 'level-up');
  });

  test('the match log shows a record once results exist', function () {
    var s = state();
    s.log = [
      { id: '1', date: '2026-10-01', opponent: 'A', venue: 'home', formation: '433A', plan: 'PlayWide', theirFormation: '442A', mine: 2, theirs: 0, result: 'W' },
      { id: '2', date: '2026-10-02', opponent: 'B', venue: 'away', formation: '433A', plan: 'PlayWide', theirFormation: '', mine: 1, theirs: 1, result: 'D' }
    ];
    var html = ui.matchLog(s);
    ok(html.indexOf('4-3-3 A, Wing play') !== -1, 'set-up named');
    ok(html.indexOf('2.00') !== -1 && html.indexOf('chip--d') !== -1, 'points and chips');
    ok(html.indexOf('No matches logged yet') === -1, 'no empty state');
    ok(ui.matchLog(state()).indexOf('No matches logged yet') !== -1, 'empty state when empty');
  });

  test('names are escaped', function () {
    var html = ui.squad(state([{ id: 'x', name: '<img src=x onerror=1>', position: 'ST', att: 80, def: 30 }]));
    ok(html.indexOf('<img src=x') === -1, 'no raw markup');
  });

  /* ---- storage ---- */

  test('migration repairs what it cannot use', function () {
    var m = OSM.store._migrate({ squad: { formation: '999', variant: 'C', players: [{ position: 'XX' }, { name: 'Ok', position: 'ST', att: '90', def: 30 }] }, log: [{ result: 'Q' }] });
    eq(m.squad.formation, '433', 'unknown formation falls back');
    eq(m.squad.variant, 'A', 'unknown variant falls back');
    eq(m.squad.players.length, 1, 'unknown position dropped');
    eq(m.squad.players[0].att, 90, 'numbers parsed');
    eq(m.log.length, 0, 'unreadable result dropped');
  });

  test('nothing saved means the example squad', function () {
    var m = OSM.store._migrate(null);
    eq(m.squad.example, true, 'flagged as example');
    eq(m.squad.players.length, 20, 'twenty players');
    eq(m.schema, 1, 'schema');
  });
})(window.OSM);
