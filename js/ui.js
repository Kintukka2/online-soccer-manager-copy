(function (OSM) {
  'use strict';

  // Markup only. Every function takes data and returns an HTML string, so the
  // pages can be built and checked in tests.html with no app shell. The rules
  // these pages show live in engine.js and data.js, never here.

  var data = OSM.data;
  var engine = OSM.engine;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function options(list, selected) {
    return list.map(function (o) {
      return '<option value="' + esc(o.value) + '"' + (o.value === selected ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
  }

  function formationOptions() {
    var out = [];
    data.FORMATIONS.forEach(function (f) {
      data.VARIANTS.forEach(function (v) { out.push({ value: f.code + v, label: f.name + ' ' + v }); });
    });
    return out;
  }

  function positionOptions() {
    return data.POSITIONS.map(function (p) { return { value: p.abbr, label: p.abbr }; });
  }

  function formationName(value) {
    if (!value) return '';
    var f = data.formation(value.slice(0, 3));
    return f ? f.name + ' ' + value.slice(3) : value;
  }

  // Where a figure came from, on the face of every tool that uses one.
  function source(kind) {
    return kind === 'game'
      ? '<span class="src src--game">Game rule</span>'
      : '<span class="src src--community">Community figure</span>';
  }

  function head(title, sub) {
    return '<div class="sec-head"><div class="wrap sec-head__in"><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div></div>';
  }

  function circle(value, label, tier, small) {
    return '<div class="circ' + (small ? ' circ--sm' : '') + (tier ? ' t-' + tier : '') + '">' +
      '<div>' + (label ? '<small>' + esc(label) + '</small>' : '') + esc(value) + '</div></div>';
  }

  var SILHOUETTE = '<svg viewBox="0 0 84 72" aria-hidden="true"><circle cx="42" cy="26" r="15" fill="#2A3E57"/>' +
    '<path d="M8 72c3-18 17-28 34-28s31 10 34 28Z" fill="#2A3E57"/></svg>';

  function lineupCard(p) {
    return '<div class="lcard-wrap"><div class="lcard"><div class="lcard__face">' +
      '<div class="lcard__who">' + SILHOUETTE + '</div>' +
      '<div class="lcard__num"><span>' + esc(p.position) + '</span><b>' + engine.mainStat(p) + '</b></div>' +
      '</div></div><div class="lcard__name">' + esc(p.name || p.position) + '</div></div>';
  }

  function emptySlot() {
    return '<div class="lcard-wrap"><div class="lslot" role="img" aria-label="Empty slot"><i>+</i></div><div class="lcard__name">&nbsp;</div></div>';
  }

  /* ---------- home ---------- */

  function home() {
    var tools = [
      ['squad', 'Squad strength', 'The number on the match preview, worked out the way the game does it. Then the formation that gets the most from your squad.'],
      ['tactics', 'Tactics', 'All 24 formations on the board, the five game plans, and what managers pair them with.'],
      ['calculators', 'Calculators', 'Training Camp costs, savings interest, training time, asking prices and level-ups.'],
      ['log', 'Match log', 'Record each result with the set-up you used, and see which set-ups win.']
    ];
    return '<section class="masthead"><div class="wrap masthead__body">' +
      '<span class="notch">Online Soccer Manager 26/27</span>' +
      '<h1 class="masthead__title">Run your squad<br>by the <em>numbers</em>.</h1>' +
      '<p class="lede">Free tools for Online Soccer Manager. Work out your strength badge, pick a formation, cost a Training Camp and keep a record of what wins.</p>' +
      '<div class="band" aria-hidden="true"></div>' +
      '</div></section>' +
      '<div class="wrap sec-body"><div class="tiles">' +
      tools.map(function (t) {
        return '<a class="tile" href="#/' + t[0] + '"><b>' + esc(t[1]) + '</b><span>' + esc(t[2]) + '</span><i>Open</i></a>';
      }).join('') +
      '</div></div>';
  }

  /* ---------- squad ---------- */

  function squad(state) {
    var sq = state.squad;
    var players = sq.players;
    var code = sq.formation;
    var s = engine.squadStrength(players, code);
    var f = data.formation(code);
    var ranked = engine.rankFormations(players);

    var note = sq.example
      ? '<div class="note"><p><strong>Example squad.</strong> Replace these players with your own, or start from an empty squad. ' +
        '<button type="button" class="linkish" data-action="clear-squad">Clear squad</button></p></div>'
      : (players.length ? '' : '<div class="note"><p>Your squad is empty. Add players below, or ' +
        '<button type="button" class="linkish" data-action="load-example">load the example squad</button>.</p></div>');

    var shortNote = s.short.length && players.length
      ? '<p class="warn">Not enough ' + s.short.map(function (k) { return data.line(k).plural.toLowerCase(); }).join(' or ') +
        ' for ' + esc(f.name) + '. The game averages the slots it can fill, so this number flatters the squad.</p>'
      : '';

    // The line-up, forwards at the top as the game draws it.
    var pick = {};
    s.picked.forEach(function (id) { pick[id] = true; });
    var byLine = { G: [], D: [], M: [], A: [] };
    players.forEach(function (p) { if (pick[p.id]) byLine[data.lineOf(p.position)].push(p); });
    ['G', 'D', 'M', 'A'].forEach(function (k) {
      byLine[k].sort(function (a, b) { return engine.mainStat(b) - engine.mainStat(a); });
    });
    var rows = ['A', 'M', 'D', 'G'].map(function (k) {
      var cards = byLine[k].map(lineupCard);
      for (var i = byLine[k].length; i < s.lines[k].need; i++) cards.push(emptySlot());
      return '<div class="pitch__row">' + cards.join('') + '</div>';
    }).join('');

    var best = ranked.slice(0, 6).map(function (r, i) {
      var on = r.code === code;
      return '<button type="button" class="rank' + (on ? ' is-on' : '') + '" data-action="pick-formation" data-code="' + r.code + '">' +
        '<span class="rank__n">' + (i + 1) + '</span><span class="rank__name">' + esc(r.name) + '</span>' +
        (r.short.length ? '<span class="rank__short">short</span>' : '') +
        '<span class="rank__exact">' + r.exact.toFixed(1) + '</span>' +
        '<span class="rank__v t-' + r.tier + '">' + r.strength + '</span></button>';
    }).join('');

    var table = '<div class="squad" role="table" aria-label="Your squad">' +
      '<div class="squad__head" role="row"><span>Pos</span><span>Name</span><span>Att</span><span>Def</span><span>Ovr</span><span><span class="sr">Remove</span></span></div>' +
      players.slice().sort(function (a, b) {
        var order = { G: 0, D: 1, M: 2, A: 3 };
        var la = order[data.lineOf(a.position)], lb = order[data.lineOf(b.position)];
        return la !== lb ? la - lb : engine.mainStat(b) - engine.mainStat(a);
      }).map(function (p) {
        var line = data.line(data.lineOf(p.position));
        var ovr = engine.overall(p.att, p.def);
        var cls = function (stat) { return line.stat === stat ? ' main' : ''; };
        return '<div class="squad__row' + (pick[p.id] ? ' is-picked' : '') + '" role="row">' +
          '<select aria-label="Position" data-action="player" data-field="position" data-id="' + p.id + '" data-focus="pos-' + p.id + '">' + options(positionOptions(), p.position) + '</select>' +
          '<input aria-label="Name" data-action="player" data-field="name" data-id="' + p.id + '" data-focus="name-' + p.id + '" value="' + esc(p.name) + '" placeholder="Name">' +
          '<input aria-label="Attack" class="num' + cls('att') + '" inputmode="numeric" data-action="player" data-field="att" data-id="' + p.id + '" data-focus="att-' + p.id + '" value="' + esc(p.att) + '">' +
          '<input aria-label="Defence" class="num' + cls('def') + '" inputmode="numeric" data-action="player" data-field="def" data-id="' + p.id + '" data-focus="def-' + p.id + '" value="' + esc(p.def) + '">' +
          '<span class="ovr' + cls('ovr') + '">' + ovr + '</span>' +
          '<button type="button" class="x" aria-label="Remove ' + esc(p.name || p.position) + '" data-action="remove-player" data-id="' + p.id + '">&times;</button>' +
          '</div>';
      }).join('') +
      '<form class="squad__row squad__add" data-action="add-player" aria-label="Add a player">' +
      '<select aria-label="Position" name="position" data-focus="add-pos">' + options(positionOptions(), 'CM') + '</select>' +
      '<input aria-label="Name" name="name" placeholder="New player" data-focus="add-name">' +
      '<input aria-label="Attack" class="num" name="att" inputmode="numeric" placeholder="Att" data-focus="add-att">' +
      '<input aria-label="Defence" class="num" name="def" inputmode="numeric" placeholder="Def" data-focus="add-def">' +
      '<span class="ovr"></span>' +
      '<button type="submit" class="plus" aria-label="Add player">+</button>' +
      '</form></div>';

    return head('Squad strength', 'The number on the match preview, worked out the game’s way') +
      '<div class="wrap sec-body">' + note +
      '<div class="squad-top">' +
      '<div class="panel">' +
      '<label class="field"><span>Formation</span><select id="formation" data-action="formation" data-focus="formation">' +
      options(formationOptions(), code + sq.variant) + '</select></label>' +
      '<div class="strength">' + circle(s.strength, 'Team', s.tier) +
      '<div class="strength__lines">' + data.LINES.map(function (l) { return circle(s.lines[l.key].avg, l.short, null, true); }).join('') + '</div></div>' +
      '<p class="strength__cap">' + esc(s.tier.charAt(0).toUpperCase() + s.tier.slice(1)) + ' badge ' + source('game') + '</p>' + shortNote +
      '</div>' +
      '<div class="panel"><h2 class="panel__title">Best formations for this squad</h2>' +
      (players.length ? '<div class="ranks">' + best + '</div>' : '<p class="hint">Add players and every formation is ranked here.</p>') +
      '<p class="hint">Ranked by the exact average, which the badge rounds. Both variants of a shape field the same lines, so they share a strength.</p></div>' +
      '</div>' +
      '<div class="pitch" aria-label="Line-up for ' + esc(f.name) + '">' + rows + '</div>' +
      '<h2 class="h2">Your squad</h2>' +
      '<p class="hint">Enter Attack and Defence as the squad screen shows them. Overall is worked out from those two, and the stat that counts for each line is highlighted.</p>' +
      '<div class="tblwrap">' + table + '</div>' +
      '</div>';
  }

  /* ---------- tactics ---------- */

  function tactics() {
    var shapes = data.FORMATIONS.map(function (f) {
      var mid = f.mid
        ? '<p class="shape__mid"><b>A</b> ' + f.mid.A.join(' · ') + '<br><b>B</b> ' + f.mid.B.join(' · ') + '</p>'
        : '<p class="shape__mid">Variants A and B</p>';
      return '<figure class="shape"><div class="board">' + OSM.board.formation(f.code, 'A', { small: false }) + '</div>' +
        '<figcaption><b>' + esc(f.name) + '</b>' + mid + '</figcaption></figure>';
    }).join('');

    var plans = data.PAIRINGS.map(function (p) {
      var plan = data.plan(p.plan);
      return '<div class="tac"><div class="tac__label">Game plan</div><div class="tac__val">' + esc(plan.name) + '</div>' +
        '<p class="tac__row"><span>Pairs with</span>' + p.formations.map(function (c) { return esc(data.formation(c).name); }).join(', ') + '</p>' +
        '<p class="tac__row"><span>Use against</span>' + esc(p.against) + '</p></div>';
    }).join('');

    var steps = data.TACKLING.map(function (t, i) {
      return '<i class="' + (i === 1 ? 'on' : '') + '">' + esc(t.name) + '</i>';
    }).join('');

    var meta = data.META.map(function (m) {
      return '<tr><td>' + esc(m.situation) + '</td><td>' + esc(m.setup) + '</td><td class="num">' + esc(m.sliders) + '</td></tr>';
    }).join('');

    var lines = Object.keys(data.LINE_TACTICS).map(function (k) {
      return '<div class="tac tac--plain"><div class="tac__label">' + esc(k.charAt(0).toUpperCase() + k.slice(1)) + '</div>' +
        '<ul class="opts">' + data.LINE_TACTICS[k].map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>';
    }).join('');

    return head('Tactics', 'Every option the game offers, and what managers do with them') +
      '<div class="wrap sec-body">' +
      '<h2 class="h2">Formations ' + source('game') + '</h2>' +
      '<p class="hint">Twelve shapes, each with an A and a B variant. Midfield positions are shown where the game’s layout is known.</p>' +
      '<div class="shapes">' + shapes + '</div>' +
      '<h2 class="h2">Game plans ' + source('community') + '</h2>' +
      '<p class="hint">The game plan has to fit the shape. These are the pairings most guides agree on.</p>' +
      '<div class="tacs">' + plans + '</div>' +
      '<h2 class="h2">Tackling ' + source('game') + '</h2>' +
      '<div class="tac tac--wide"><div class="steps" aria-hidden="true">' + steps + '</div>' +
      '<p class="tac__row"><span>Referees</span>' + data.REFEREES.join(', ') + '. The referee changes every match, so the right tackling does too.</p>' +
      '<p class="tac__row"><span>Managers say</span>Careful against a very strict referee, Aggressive only against a lenient one. Harder tackling costs cards, injuries and stamina.</p></div>' +
      '<h2 class="h2">Line tactics, marking, offside ' + source('game') + '</h2>' +
      '<div class="tacs">' + lines +
      '<div class="tac tac--plain"><div class="tac__label">Marking</div><ul class="opts">' + data.MARKING.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="tac tac--plain"><div class="tac__label">Offside trap</div><ul class="opts"><li>On</li><li>Off</li></ul></div></div>' +
      '<h2 class="h2">Sliders by situation ' + source('community') + '</h2>' +
      '<div class="tblwrap"><table class="tbl"><thead><tr><th>Situation</th><th>Set-up</th><th>Pressing / Style / Tempo</th></tr></thead><tbody>' + meta + '</tbody></table></div>' +
      '<p class="hint">Starting points from October 2026 guides. Log your results to see what works for your squad.</p>' +
      '</div>';
  }

  /* ---------- calculators ---------- */

  function calc(id, title, kind, fields, out) {
    return '<form class="calc" data-calc="' + id + '" aria-label="' + esc(title) + '">' +
      '<div class="calc__head"><h2>' + esc(title) + '</h2>' + source(kind) + '</div>' +
      '<div class="calc__fields">' + fields + '</div>' +
      '<div class="calc__out" data-out="' + id + '">' + out + '</div></form>';
  }

  function numField(name, label, value, extra) {
    return '<label class="field"><span>' + esc(label) + '</span><input name="' + name + '" id="calc-' + name + '" inputmode="decimal" value="' + esc(value) + '"' + (extra || '') + '></label>';
  }

  function calculators() {
    return head('Calculators', 'The sums behind training, money and the transfer list') +
      '<div class="wrap sec-body"><div class="calcs">' +
      calc('camp', 'Training Camp cost', 'community',
        numField('bought', 'Camps already bought in this league', 0), campOut({ bought: 0 })) +
      calc('savings', 'Savings interest', 'community',
        numField('balance', 'In Savings', '20M') + numField('matches', 'Matches', 10), savingsOut({ balance: '20M', matches: 10 })) +
      calc('training', 'Training time', 'community',
        numField('from', 'Rating now', 88) + numField('to', 'Target rating', 92) +
        '<label class="field"><span>Training Facility</span><select name="facility" id="calc-facility">' +
        options([0, 1, 2, 3].map(function (n) { return { value: String(n), label: n ? 'Level ' + n : 'Not built' }; }), '0') + '</select></label>',
        trainingOut({ from: 88, to: 92, facility: 0 })) +
      calc('sale', 'Asking price', 'community',
        numField('value', 'Player value', '20M'), saleOut({ value: '20M' })) +
      calc('levelup', 'One training level', 'game',
        '<label class="field"><span>Position</span><select name="position" id="calc-position">' + options(positionOptions(), 'CM') + '</select></label>' +
        numField('att', 'Attack', 80) + numField('def', 'Defence', 76), levelOut({ position: 'CM', att: 80, def: 76 })) +
      '</div></div>';
  }

  function campOut(v) {
    var bought = Math.max(0, Math.min(6, Math.round(Number(v.bought) || 0)));
    var rows = data.CAMP.costs.map(function (c, i) {
      var n = i + 1;
      return '<tr class="' + (n <= bought ? 'done' : (n === bought + 1 ? 'next' : '')) + '"><td>' + n + '</td><td class="num">' + c +
        ' BC</td><td class="num">' + engine.campTotal(n) + ' BC</td></tr>';
    }).join('');
    var lead = bought >= 6
      ? '<p class="big">All six used</p><p class="hint">A league allows six Training Camps.</p>'
      : '<p class="big">' + engine.campCost(bought + 1) + ' BC</p><p class="hint">for camp ' + (bought + 1) + ' of 6. Six cost ' + engine.campTotal(6) + ' BC in all.</p>';
    return lead + '<div class="tblwrap"><table class="tbl tbl--mini"><thead><tr><th>Camp</th><th>Cost</th><th>Running total</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function savingsOut(v) {
    var bal = engine.parseMoney(v.balance);
    if (bal == null) return '<p class="warn">Enter an amount like 20M, 750K or 1500000.</p>';
    var r = engine.savingsAfter(bal, v.matches);
    return '<p class="big">' + engine.money(r.final) + '</p><p class="hint">after ' + r.rows.length + ' matches, ' +
      engine.money(r.earned) + ' of it interest. Interest is paid only on money in Savings when a match is simulated.</p>';
  }

  function trainingOut(v) {
    var from = Math.round(Number(v.from)), to = Math.round(Number(v.to));
    if (!(from > 0) || !(to > 0)) return '<p class="warn">Enter two ratings.</p>';
    if (to <= from) return '<p class="warn">The target has to be above the rating now.</p>';
    var t = engine.trainingSessions(from, to, v.facility);
    var sessions = t.min === t.max ? String(t.min) : t.min + ' to ' + t.max;
    return '<p class="big">' + sessions + ' sessions</p><p class="hint">' + t.hoursMin + (t.hoursMax !== t.hoursMin ? ' to ' + t.hoursMax : '') +
      ' hours of one coach’s time. Gains slow sharply from a rating of 100.</p>';
  }

  function saleOut(v) {
    var val = engine.parseMoney(v.value);
    if (val == null) return '<p class="warn">Enter a value like 20M or 750K.</p>';
    var b = engine.saleBand(val);
    return '<p class="big">' + engine.money(b.min) + ' to ' + engine.money(b.max) + '</p><p class="hint">The range a listing can ask. A higher price sells more slowly.</p>';
  }

  function levelOut(v) {
    if (!data.lineOf(v.position)) return '';
    var before = { position: v.position, att: Math.round(Number(v.att) || 0), def: Math.round(Number(v.def) || 0) };
    var after = engine.levelUp(before);
    var line = data.line(data.lineOf(v.position));
    return '<p class="big">' + after.att + ' / ' + after.def + ' / ' + after.ovr + '</p>' +
      '<p class="hint">Attack / Defence / Overall after one level. ' + esc(line.plural) + ' count ' +
      { att: 'Attack', def: 'Defence', ovr: 'Overall' }[line.stat] + ', now ' + engine.mainStat({ position: v.position, att: after.att, def: after.def }) + '.</p>';
  }

  var CALC_OUT = { camp: campOut, savings: savingsOut, training: trainingOut, sale: saleOut, levelup: levelOut };

  /* ---------- match log ---------- */

  function chip(result) {
    return '<i class="chip chip--' + result.toLowerCase() + '">' + result + '</i>';
  }

  function record(groups, label) {
    if (!groups.length) return '';
    return '<div class="tblwrap"><table class="tbl tbl--rec"><thead><tr><th>' + esc(label) + '</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts per game</th></tr></thead><tbody>' +
      groups.map(function (g) {
        return '<tr><td>' + esc(g.label) + '</td><td class="num">' + g.played + '</td><td class="num">' + g.W + '</td><td class="num">' + g.D + '</td><td class="num">' + g.L +
          '</td><td class="num">' + g.ppg.toFixed(2) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function matchLog(state) {
    var log = state.log;
    var fopts = formationOptions();
    var form = '<form class="logform" data-action="add-log" aria-label="Log a result">' +
      '<label class="field"><span>Date</span><input type="date" name="date" id="log-date" value="' + new Date().toISOString().slice(0, 10) + '"></label>' +
      '<label class="field"><span>Opponent</span><input name="opponent" id="log-opponent" placeholder="Club"></label>' +
      '<label class="field"><span>Venue</span><select name="venue" id="log-venue">' + options([{ value: 'home', label: 'Home' }, { value: 'away', label: 'Away' }], 'home') + '</select></label>' +
      '<label class="field"><span>Your formation</span><select name="formation" id="log-formation">' + options(fopts, state.squad.formation + state.squad.variant) + '</select></label>' +
      '<label class="field"><span>Game plan</span><select name="plan" id="log-plan">' + options(data.GAME_PLANS.map(function (g) { return { value: g.key, label: g.name }; }), 'PlayWide') + '</select></label>' +
      '<label class="field"><span>Tackling</span><select name="tackling" id="log-tackling">' + options(data.TACKLING.map(function (t) { return { value: t.key, label: t.name }; }), 'Normal') + '</select></label>' +
      '<label class="field"><span>Their formation</span><select name="theirFormation" id="log-their">' + options([{ value: '', label: 'Not known' }].concat(fopts), '') + '</select></label>' +
      '<label class="field"><span>Referee</span><select name="referee" id="log-referee">' + options([{ value: '', label: 'Not known' }].concat(data.REFEREES.map(function (r) { return { value: r, label: r }; })), '') + '</select></label>' +
      '<label class="field field--score"><span>Your goals</span><input name="mine" id="log-mine" inputmode="numeric" value="0"></label>' +
      '<label class="field field--score"><span>Their goals</span><input name="theirs" id="log-theirs" inputmode="numeric" value="0"></label>' +
      '<div class="logform__go"><button type="submit" class="btn btn--orange"><span>Log result</span></button></div>' +
      '</form>';

    var body;
    if (!log.length) {
      body = '<div class="emptydemo"><div class="board board--empty">' + OSM.board.empty() + '</div>' +
        '<h3>No matches logged yet</h3><p>Log each result with the set-up you used. After a few matchdays this shows which formations and game plans win for you.</p></div>';
    } else {
      var setups = engine.recordBy(log.map(function (e) {
        return { setup: formationName(e.formation) + ', ' + ((data.plan(e.plan) || {}).name || ''), result: e.result };
      }), 'setup').map(function (g) { g.label = g.key; return g; });
      var against = engine.recordBy(log.filter(function (e) { return e.theirFormation; }), 'theirFormation')
        .map(function (g) { g.label = formationName(g.key); return g; });
      var all = engine.recordBy(log.map(function (e) { return { all: 'All', result: e.result }; }), 'all')[0];
      body = '<div class="logsum">' + circle(all.played, 'Played', null) +
        '<div class="logsum__wdl">' + chip('W') + ' ' + all.W + ' &nbsp; ' + chip('D') + ' ' + all.D + ' &nbsp; ' + chip('L') + ' ' + all.L + '</div></div>' +
        '<h2 class="h2">By set-up</h2>' + record(setups, 'Your set-up') +
        (against.length ? '<h2 class="h2">Against their formation</h2>' + record(against, 'They played') : '') +
        '<h2 class="h2">Results</h2><ol class="results">' + log.map(function (e) {
          return '<li class="res">' + chip(e.result) +
            '<span class="res__score">' + e.mine + ' – ' + e.theirs + '</span>' +
            '<span class="res__what"><b>' + esc(e.opponent || 'Opponent') + '</b> · ' + (e.venue === 'away' ? 'Away' : 'Home') + ' · ' + esc(e.date) +
            '<br>' + esc(formationName(e.formation)) + ', ' + esc((data.plan(e.plan) || {}).name || '') +
            (e.theirFormation ? ' vs ' + esc(formationName(e.theirFormation)) : '') + '</span>' +
            '<button type="button" class="x" aria-label="Remove this result" data-action="remove-log" data-id="' + e.id + '">&times;</button></li>';
        }).join('') + '</ol>';
    }
    return head('Match log', 'Your results, with the set-up behind each one') +
      '<div class="wrap sec-body">' + form + body + '</div>';
  }

  /* ---------- about ---------- */

  function about() {
    return head('About', 'What OSMWiz is, and where your data lives') +
      '<div class="wrap sec-body prose">' +
      '<p>OSMWiz is a free companion for Online Soccer Manager, built by players. It works out the numbers the game shows but does not explain.</p>' +
      '<h2 class="h2">Where the numbers come from</h2>' +
      '<p>Each tool marks its figures. ' + source('game') + ' is a rule the game itself applies. ' + source('community') + ' comes from moderators, guides and managers who measured it.</p>' +
      '<h2 class="h2">Your data</h2>' +
      '<p>Your squad and match log stay on this device. There is no account and nothing is sent anywhere. To move them to another device, export a file here and import it there.</p>' +
      '<div class="row"><button type="button" class="btn btn--navy" data-action="export"><span>Export</span></button>' +
      '<label class="btn btn--alt filebtn"><span>Import</span><input type="file" id="import-file" accept="application/json,.json" data-action="import"></label></div>' +
      '<p class="hint" id="io-status" role="status"></p>' +
      '<h2 class="h2">Not official</h2>' +
      '<p>OSMWiz is an independent companion for Online Soccer Manager. It is not made, endorsed or reviewed by Gamebasics B.V. or Miniclip.</p>' +
      '<p class="hint">Version ' + esc(data.VERSION) + '</p>' +
      '</div>';
  }

  OSM.ui = {
    esc: esc,
    home: home,
    squad: squad,
    tactics: tactics,
    calculators: calculators,
    calcOut: CALC_OUT,
    matchLog: matchLog,
    about: about,
    formationName: formationName
  };
})(window.OSM = window.OSM || {});
