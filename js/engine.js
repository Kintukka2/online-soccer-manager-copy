(function (OSM) {
  'use strict';

  // All pure logic: numbers in, numbers out. No DOM and no storage, which is
  // what lets tests.html check every rule here without the app shell.

  var data = OSM.data;

  function toInt(v) {
    var n = Math.round(Number(v));
    return isFinite(n) ? n : 0;
  }

  /* ---------- players ---------- */

  // V: the client's level-up recomputes Overall as floor((Att + Def) / 2).
  function overall(att, def) {
    return Math.floor((toInt(att) + toInt(def)) / 2);
  }

  // The stat the game counts for a player's line: Att up front, Ovr in
  // midfield, Def at the back and in goal.
  function mainStat(player) {
    var line = data.line(player.line || data.lineOf(player.position));
    if (!line) return 0;
    if (line.stat === 'att') return toInt(player.att);
    if (line.stat === 'def') return toInt(player.def);
    return overall(player.att, player.def);
  }

  // V: one training level. Forwards gain Attack, midfielders gain both,
  // defenders and keepers gain Defence; Overall follows the formula.
  function levelUp(player) {
    var line = player.line || data.lineOf(player.position);
    var att = toInt(player.att);
    var def = toInt(player.def);
    if (line === 'A') att += 1;
    else if (line === 'M') { att += 1; def += 1; }
    else def += 1;
    return { att: att, def: def, ovr: overall(att, def) };
  }

  /* ---------- squad strength ---------- */

  // How many of each line a formation fields. V: hundreds digit defenders,
  // tens midfielders, units forwards, and always one keeper.
  function counts(code) {
    var c = parseInt(code, 10);
    return { G: 1, D: Math.floor(c / 100 % 10), M: Math.floor(c / 10 % 10), A: c % 10 };
  }

  function tierFor(strength) {
    for (var i = 0; i < data.TIERS.length; i++) {
      if (strength >= data.TIERS[i].min) return data.TIERS[i].name;
    }
    return 'blue';
  }

  // V: getAverageLineupStrength. For each line, the best N players by that
  // line's stat, where N is the formation's count; then one average across
  // every value taken, rounded. A short line contributes what it has, which
  // is what the client does, and is reported so the app can say so.
  function squadStrength(players, code) {
    var need = counts(code);
    var values = [];
    var lines = {};
    var picked = [];
    data.LINES.forEach(function (line) {
      var pool = players
        .filter(function (p) { return (p.line || data.lineOf(p.position)) === line.key; })
        .map(function (p) { return { id: p.id, value: mainStat(p) }; })
        .sort(function (a, b) { return b.value - a.value; });
      var taken = pool.slice(0, need[line.key]);
      var sum = taken.reduce(function (s, t) { return s + t.value; }, 0);
      lines[line.key] = {
        need: need[line.key],
        have: taken.length,
        avg: taken.length ? Math.round(sum / taken.length) : 0
      };
      taken.forEach(function (t) { values.push(t.value); picked.push(t.id); });
    });
    var total = values.reduce(function (s, v) { return s + v; }, 0);
    // The badge is the rounded figure, as the game shows it. The exact mean
    // is kept as well: five shapes can share an 86, and choosing between
    // them needs the decimal the badge throws away.
    var exact = values.length ? total / values.length : 0;
    var strength = Math.round(exact);
    var short = data.LINES.filter(function (l) { return lines[l.key].have < lines[l.key].need; })
      .map(function (l) { return l.key; });
    return { strength: strength, exact: exact, tier: tierFor(strength), lines: lines, picked: picked, short: short };
  }

  // Every shape scored for one squad, strongest first. A shape the squad
  // cannot fill sinks below every shape it can, whatever its average says,
  // because a strength built on an empty slot is not one the game will field.
  function rankFormations(players) {
    return data.FORMATIONS.map(function (f) {
      var s = squadStrength(players, f.code);
      return { code: f.code, name: f.name, strength: s.strength, exact: s.exact, tier: s.tier, short: s.short };
    }).sort(function (a, b) {
      var fa = a.short.length ? 1 : 0;
      var fb = b.short.length ? 1 : 0;
      if (fa !== fb) return fa - fb;
      if (b.exact !== a.exact) return b.exact - a.exact;
      return data.FORMATIONS.indexOf(data.formation(a.code)) - data.FORMATIONS.indexOf(data.formation(b.code));
    });
  }

  /* ---------- calculators ---------- */

  // C: the nth Training Camp in a league, and everything up to it.
  function campCost(n) {
    var costs = data.CAMP.costs;
    if (n < 1 || n > costs.length) return null;
    return costs[n - 1];
  }

  function campTotal(n) {
    var total = 0;
    for (var i = 1; i <= Math.min(n, data.CAMP.costs.length); i++) total += campCost(i);
    return total;
  }

  // C: 2% per match on what stays in Savings, compounding, because the
  // interest is paid into Savings itself.
  function savingsAfter(balance, matches, rate) {
    var r = rate == null ? data.SAVINGS_RATE : rate;
    var b = Math.max(0, Number(balance) || 0);
    var rows = [];
    for (var i = 1; i <= Math.max(0, toInt(matches)); i++) {
      var interest = b * r;
      b += interest;
      rows.push({ match: i, interest: interest, balance: b });
    }
    return { final: b, earned: b - Math.max(0, Number(balance) || 0), rows: rows };
  }

  // C: how many sessions a player needs to go from one rating to another.
  // A session fills part of a bar and a full bar is one point, with any
  // overflow kept. Players under 100 fill 50-80% a session and players at
  // 100 or more fill 20-40%, so the answer is a range: the best case runs
  // every session at the top of the band and the worst at the bottom.
  function trainingSessions(from, to, facilityLevel) {
    from = toInt(from);
    to = toInt(to);
    var boost = 1 + (data.TRAINING.facility[toInt(facilityLevel)] || 0);
    function run(pick) {
      var rating = from;
      var bar = 0;
      var sessions = 0;
      while (rating < to && sessions < 10000) {
        var band = rating < 100 ? data.TRAINING.gainBelow100 : data.TRAINING.gainFrom100;
        bar += pick(band) * boost;
        sessions++;
        // Five sessions of 0.2 sum to 0.9999999999999999 in floating point,
        // which would cost a phantom extra session; hence the tolerance.
        while (bar >= 1 - 1e-9 && rating < to) { bar -= 1; rating++; }
      }
      return sessions;
    }
    if (to <= from) return { min: 0, max: 0, hoursMin: 0, hoursMax: 0 };
    var min = run(function (b) { return b[1]; });
    var max = run(function (b) { return b[0]; });
    return {
      min: min,
      max: max,
      hoursMin: min * data.TRAINING.sessionHours,
      hoursMax: max * data.TRAINING.sessionHours
    };
  }

  // C: the asking-price band a listing must sit inside.
  function saleBand(value) {
    var v = Math.max(0, Number(value) || 0);
    return { min: v * data.SALE_BAND.min, max: v * data.SALE_BAND.max };
  }

  /* ---------- formatting ---------- */

  // Money the way the game prints it: 200K, 2.5M, 262M.
  function money(n) {
    var v = Number(n) || 0;
    var sign = v < 0 ? '-' : '';
    v = Math.abs(v);
    function trim(x) { return (Math.round(x * 10) / 10).toString(); }
    if (v >= 1e9) return sign + trim(v / 1e9) + 'B';
    if (v >= 1e6) return sign + trim(v / 1e6) + 'M';
    if (v >= 1e3) return sign + trim(v / 1e3) + 'K';
    return sign + Math.round(v).toString();
  }

  // Reads a value typed the way the game prints it: "2.5M", "200K", "1200".
  function parseMoney(text) {
    var m = String(text == null ? '' : text).trim().toUpperCase().replace(/,/g, '').match(/^(-?\d+(?:\.\d+)?)\s*([KMB])?$/);
    if (!m) return null;
    var mult = { K: 1e3, M: 1e6, B: 1e9 }[m[2]] || 1;
    return Number(m[1]) * mult;
  }

  /* ---------- the match log ---------- */

  // W/D/L counts and points per game, grouped by any field of a log entry.
  function recordBy(entries, key) {
    var groups = {};
    entries.forEach(function (e) {
      var k = e[key];
      if (!k) return;
      var g = groups[k] || (groups[k] = { key: k, played: 0, W: 0, D: 0, L: 0 });
      g.played++;
      if (e.result === 'W' || e.result === 'D' || e.result === 'L') g[e.result]++;
    });
    return Object.keys(groups).map(function (k) {
      var g = groups[k];
      g.points = g.W * 3 + g.D;
      g.ppg = g.played ? g.points / g.played : 0;
      return g;
    }).sort(function (a, b) {
      if (b.ppg !== a.ppg) return b.ppg - a.ppg;
      return b.played - a.played;
    });
  }

  // Goals are entered from the manager's side, so the venue never matters.
  function resultOf(mine, theirs) {
    mine = toInt(mine);
    theirs = toInt(theirs);
    if (mine > theirs) return 'W';
    if (mine < theirs) return 'L';
    return 'D';
  }

  OSM.engine = {
    overall: overall,
    mainStat: mainStat,
    levelUp: levelUp,
    counts: counts,
    tierFor: tierFor,
    squadStrength: squadStrength,
    rankFormations: rankFormations,
    campCost: campCost,
    campTotal: campTotal,
    savingsAfter: savingsAfter,
    trainingSessions: trainingSessions,
    saleBand: saleBand,
    money: money,
    parseMoney: parseMoney,
    recordBy: recordBy,
    resultOf: resultOf
  };
})(window.OSM = window.OSM || {});
