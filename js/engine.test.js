(function (OSM) {
  'use strict';

  var t = OSM.t, test = t.test, eq = t.eq, ok = t.ok, near = t.near, deepEq = t.deepEq;
  var e = OSM.engine;

  // The example squad's ratings, by position, Att, Def. Every expected value
  // below was worked by hand from these before the engine ran them.
  var ROWS = [['GK', 20, 86], ['GK', 18, 78], ['CB', 45, 88], ['CB', 42, 85], ['LB', 60, 84], ['RB', 62, 82],
    ['CB', 40, 80], ['LB', 55, 76], ['CDM', 78, 90], ['CM', 88, 86], ['CAM', 92, 74], ['LM', 86, 70], ['RM', 85, 72],
    ['CM', 80, 80], ['CDM', 70, 82], ['ST', 93, 35], ['ST', 88, 30], ['LF', 84, 38], ['RF', 82, 36], ['ST', 76, 30]];
  function squad() {
    return ROWS.map(function (r, i) { return { id: 'p' + i, position: r[0], att: r[1], def: r[2] }; });
  }

  /* ---- players ---- */

  test('Overall is the floor of the mean of Attack and Defence', function () {
    eq(e.overall(85, 72), 78, '157 / 2 = 78.5 floors to 78');
    eq(e.overall(80, 80), 80, 'even split');
    eq(e.overall('90', '91'), 90, 'numeric strings are read as numbers');
  });

  test('each line counts its own stat', function () {
    eq(e.mainStat({ position: 'ST', att: 93, def: 35 }), 93, 'forwards count Attack');
    eq(e.mainStat({ position: 'CM', att: 88, def: 86 }), 87, 'midfielders count Overall');
    eq(e.mainStat({ position: 'CB', att: 45, def: 88 }), 88, 'defenders count Defence');
    eq(e.mainStat({ position: 'GK', att: 20, def: 86 }), 86, 'keepers count Defence');
    eq(e.mainStat({ position: 'XX', att: 90, def: 90 }), 0, 'an unknown position counts nothing');
  });

  test('a level-up raises the stats each line trains', function () {
    deepEq(e.levelUp({ position: 'ST', att: 90, def: 30 }), { att: 91, def: 30, ovr: 60 }, 'forward');
    deepEq(e.levelUp({ position: 'CM', att: 80, def: 76 }), { att: 81, def: 77, ovr: 79 }, 'midfielder');
    deepEq(e.levelUp({ position: 'CB', att: 40, def: 85 }), { att: 40, def: 86, ovr: 63 }, 'defender');
    deepEq(e.levelUp({ position: 'GK', att: 20, def: 86 }), { att: 20, def: 87, ovr: 53 }, 'keeper');
  });

  /* ---- strength ---- */

  test('formation codes give defenders, midfielders and forwards', function () {
    deepEq(e.counts('433'), { G: 1, D: 4, M: 3, A: 3 }, '4-3-3');
    deepEq(e.counts('631'), { G: 1, D: 6, M: 3, A: 1 }, '6-3-1');
    deepEq(e.counts('325'), { G: 1, D: 3, M: 2, A: 5 }, '3-2-5');
  });

  test('every formation fields eleven', function () {
    OSM.data.FORMATIONS.forEach(function (f) {
      var c = e.counts(f.code);
      eq(c.G + c.D + c.M + c.A, 11, f.name);
    });
  });

  test('strength badge tiers follow the game thresholds', function () {
    eq(e.tierFor(79), 'blue', '79');
    eq(e.tierFor(80), 'bronze', '80');
    eq(e.tierFor(89), 'bronze', '89');
    eq(e.tierFor(90), 'silver', '90');
    eq(e.tierFor(99), 'silver', '99');
    eq(e.tierFor(100), 'gold', '100');
    eq(e.tierFor(0), 'blue', '0');
  });

  test('4-3-3 strength: best N per line by main stat, one rounded mean', function () {
    var s = e.squadStrength(squad(), '433');
    // 86 + (88+85+84+82) + (87+84+83) + (93+88+84) = 944, / 11 = 85.82
    near(s.exact, 944 / 11, 0.0001, 'exact mean');
    eq(s.strength, 86, 'badge');
    eq(s.tier, 'bronze', 'tier');
    eq(s.lines.G.avg, 86, 'keeper');
    eq(s.lines.D.avg, 85, 'defence 84.75');
    eq(s.lines.M.avg, 85, 'midfield 84.67');
    eq(s.lines.A.avg, 88, 'attack 88.33');
    eq(s.picked.length, 11, 'eleven picked');
    deepEq(s.short, [], 'nothing short');
  });

  test('4-4-2 takes a fourth midfielder and drops a forward', function () {
    var s = e.squadStrength(squad(), '442');
    // 86 + 339 + (87+84+83+80) + (93+88) = 940, / 11 = 85.45
    near(s.exact, 940 / 11, 0.0001, 'exact mean');
    eq(s.strength, 85, 'badge');
  });

  test('the best player for a slot is picked, not the first listed', function () {
    var players = squad().reverse();
    eq(e.squadStrength(players, '433').strength, 86, 'order does not matter');
  });

  test('a short line averages only the slots it can fill, and says so', function () {
    var s = e.squadStrength([
      { id: 'a', position: 'GK', att: 1, def: 80 },
      { id: 'b', position: 'CB', att: 1, def: 90 },
      { id: 'c', position: 'CB', att: 1, def: 70 }
    ], '433');
    eq(s.strength, 80, '(80 + 90 + 70) / 3');
    deepEq(s.short, ['D', 'M', 'A'], 'three lines short');
    eq(s.lines.M.avg, 0, 'an empty line averages 0');
  });

  test('an empty squad is strength 0, not NaN', function () {
    var s = e.squadStrength([], '442');
    eq(s.strength, 0, 'strength');
    eq(s.exact, 0, 'exact');
  });

  test('formations rank by exact mean, short shapes last', function () {
    var r = e.rankFormations(squad());
    eq(r.length, 12, 'all twelve shapes');
    eq(r[0].name, '4-3-3', 'strongest first');
    ok(r[0].exact >= r[1].exact, 'descending');
    eq(r[r.length - 1].name, '6-3-1', 'six defenders is the weakest fit here');
    var thin = squad().filter(function (p) { return p.position !== 'LB' && p.position !== 'RB'; });
    var ranked = e.rankFormations(thin);
    ok(ranked[ranked.length - 1].short.length > 0, 'a shape that cannot be filled sinks to the bottom');
    eq(ranked[0].short.length, 0, 'the top shape can be filled');
  });

  /* ---- calculators ---- */

  test('Training Camp costs escalate and stop at six', function () {
    eq(e.campCost(1), 10, 'first');
    eq(e.campCost(6), 500, 'sixth');
    eq(e.campCost(7), null, 'no seventh');
    eq(e.campCost(0), null, 'no zeroth');
    eq(e.campTotal(3), 80, '10 + 20 + 50');
    eq(e.campTotal(6), 880, 'all six');
    eq(e.campTotal(9), 880, 'capped at six');
  });

  test('savings compound at 2% a match', function () {
    var r = e.savingsAfter(1000000, 2);
    near(r.final, 1040400, 0.001, 'two matches');
    near(r.earned, 40400, 0.001, 'interest earned');
    eq(r.rows.length, 2, 'one row per match');
    eq(e.savingsAfter(-5, 3).final, 0, 'a negative balance earns nothing');
  });

  test('training sessions are a range from the best and worst gains', function () {
    deepEq(e.trainingSessions(88, 92, 0), { min: 5, max: 8, hoursMin: 40, hoursMax: 64 }, '88 to 92');
    deepEq(e.trainingSessions(88, 92, 3), { min: 4, max: 6, hoursMin: 32, hoursMax: 48 }, 'with a level 3 facility');
    var across = e.trainingSessions(99, 101, 0);
    eq(across.min, 3, 'slower once past 100, best case');
    eq(across.max, 7, 'five sessions of 0.2 make exactly one point');
    eq(e.trainingSessions(90, 90, 0).max, 0, 'no gap, no sessions');
  });

  test('asking price band is 0.75x to 2.5x value', function () {
    var b = e.saleBand(20000000);
    eq(b.min, 15000000, 'floor');
    eq(b.max, 50000000, 'ceiling');
  });

  /* ---- formatting ---- */

  test('money prints the way the game prints it', function () {
    eq(e.money(200000), '200K', 'thousands');
    eq(e.money(2500000), '2.5M', 'millions with one decimal');
    eq(e.money(262000000), '262M', 'whole millions');
    eq(e.money(1500), '1.5K', 'small thousands');
    eq(e.money(999), '999', 'under a thousand');
    eq(e.money(1250000000), '1.3B', 'billions');
  });

  test('money is read back from the same notation', function () {
    eq(e.parseMoney('2.5M'), 2500000, 'M');
    eq(e.parseMoney('200k'), 200000, 'lower-case k');
    eq(e.parseMoney('1,500,000'), 1500000, 'commas');
    eq(e.parseMoney(' 750K '), 750000, 'spaces');
    eq(e.parseMoney('abc'), null, 'nonsense');
    eq(e.parseMoney(''), null, 'empty');
  });

  /* ---- match log ---- */

  test('results are read from the manager’s own goals', function () {
    eq(e.resultOf(2, 1), 'W', 'win');
    eq(e.resultOf(1, 1), 'D', 'draw');
    eq(e.resultOf(0, 3), 'L', 'loss');
  });

  test('records group by any field and rank by points per game', function () {
    var r = e.recordBy([
      { f: '433A', result: 'W' }, { f: '433A', result: 'W' }, { f: '433A', result: 'L' },
      { f: '442A', result: 'D' }, { f: '', result: 'W' }
    ], 'f');
    eq(r.length, 2, 'blank keys are skipped');
    eq(r[0].key, '433A', 'best first');
    eq(r[0].points, 6, 'two wins');
    near(r[0].ppg, 2, 0.0001, 'points per game');
    eq(r[1].D, 1, 'draw counted');
  });
})(window.OSM);
