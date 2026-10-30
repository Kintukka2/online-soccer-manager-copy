(function (OSM) {
  'use strict';

  // Everything a reader saves lives under one key, on their own device.
  // VERSIONING.md: this payload and the Export file are the compatibility
  // contract, so any change to their shape goes through migrate().
  var KEY = 'osmwiz-v1';
  var SCHEMA = 1;
  var listeners = [];

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  // The example squad uses role names, never real players: a rating next to
  // a real name would be a claim about that player, and none was measured.
  var EXAMPLE = [
    ['Keeper A', 'GK', 20, 86], ['Keeper B', 'GK', 18, 78],
    ['Centre-back A', 'CB', 45, 88], ['Centre-back B', 'CB', 42, 85], ['Left-back A', 'LB', 60, 84],
    ['Right-back A', 'RB', 62, 82], ['Centre-back C', 'CB', 40, 80], ['Left-back B', 'LB', 55, 76],
    ['Holding mid A', 'CDM', 78, 90], ['Central mid A', 'CM', 88, 86], ['Playmaker', 'CAM', 92, 74],
    ['Left mid', 'LM', 86, 70], ['Right mid', 'RM', 85, 72], ['Central mid B', 'CM', 80, 80],
    ['Holding mid B', 'CDM', 70, 82],
    ['Striker A', 'ST', 93, 35], ['Striker B', 'ST', 88, 30], ['Left forward', 'LF', 84, 38],
    ['Right forward', 'RF', 82, 36], ['Striker C', 'ST', 76, 30]
  ];

  function examplePlayers() {
    return EXAMPLE.map(function (r) {
      return { id: uid('pl'), name: r[0], position: r[1], att: r[2], def: r[3] };
    });
  }

  function fresh() {
    return {
      schema: SCHEMA,
      squad: { formation: '433', variant: 'A', example: true, players: examplePlayers() },
      log: []
    };
  }

  // Older shapes are brought forward here. Schema 1 is the first, so this
  // only repairs what a hand-edited or partial payload might be missing.
  function migrate(saved) {
    var s = saved && typeof saved === 'object' ? saved : {};
    var out = fresh();
    if (s.squad && typeof s.squad === 'object') {
      out.squad.formation = OSM.data.formation(s.squad.formation) ? s.squad.formation : '433';
      out.squad.variant = s.squad.variant === 'B' ? 'B' : 'A';
      out.squad.example = !!s.squad.example;
      if (Array.isArray(s.squad.players)) {
        out.squad.players = s.squad.players.filter(function (p) { return p && OSM.data.lineOf(p.position); })
          .map(function (p) {
            return {
              id: p.id || uid('pl'),
              name: String(p.name || ''),
              position: p.position,
              att: Number(p.att) || 0,
              def: Number(p.def) || 0
            };
          });
      }
    }
    if (Array.isArray(s.log)) {
      out.log = s.log.filter(function (e) { return e && (e.result === 'W' || e.result === 'D' || e.result === 'L'); });
    }
    out.schema = SCHEMA;
    return out;
  }

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return raw ? migrate(JSON.parse(raw)) : fresh();
    } catch (e) {
      return fresh();
    }
  }

  var state = read();

  function persist() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: keep working in memory */ }
  }

  function emit() {
    persist();
    listeners.forEach(function (fn) { fn(state); });
  }

  function findPlayer(id) {
    return state.squad.players.filter(function (p) { return p.id === id; })[0] || null;
  }

  OSM.store = {
    KEY: KEY,
    getState: function () { return state; },
    subscribe: function (fn) { listeners.push(fn); },

    setFormation: function (code, variant) {
      if (!OSM.data.formation(code)) return;
      state.squad.formation = code;
      state.squad.variant = variant === 'B' ? 'B' : 'A';
      emit();
    },

    addPlayer: function (p) {
      if (!OSM.data.lineOf(p.position)) return null;
      var player = { id: uid('pl'), name: String(p.name || '').trim(), position: p.position,
        att: Number(p.att) || 0, def: Number(p.def) || 0 };
      state.squad.players.push(player);
      emit();
      return player;
    },

    updatePlayer: function (id, field, value) {
      var p = findPlayer(id);
      if (!p) return;
      if (field === 'name') p.name = String(value || '');
      else if (field === 'position' && OSM.data.lineOf(value)) p.position = value;
      else if (field === 'att' || field === 'def') p[field] = Math.max(0, Math.min(150, Math.round(Number(value) || 0)));
      else return;
      emit();
    },

    removePlayer: function (id) {
      state.squad.players = state.squad.players.filter(function (p) { return p.id !== id; });
      emit();
    },

    // Clearing the example also clears the flag, so the app stops labelling
    // whatever the reader types next as an example.
    clearSquad: function () {
      state.squad.players = [];
      state.squad.example = false;
      emit();
    },

    loadExample: function () {
      state.squad.players = examplePlayers();
      state.squad.example = true;
      emit();
    },

    // The first real edit turns the example into the reader's own squad.
    claimSquad: function () {
      if (!state.squad.example) return;
      state.squad.example = false;
      emit();
    },

    addLog: function (entry) {
      var e = {
        id: uid('m'),
        date: entry.date || new Date().toISOString().slice(0, 10),
        opponent: String(entry.opponent || '').trim(),
        venue: entry.venue === 'away' ? 'away' : 'home',
        formation: entry.formation || '',
        plan: entry.plan || '',
        tackling: entry.tackling || '',
        theirFormation: entry.theirFormation || '',
        referee: entry.referee || '',
        mine: Math.max(0, Math.round(Number(entry.mine) || 0)),
        theirs: Math.max(0, Math.round(Number(entry.theirs) || 0))
      };
      e.result = OSM.engine.resultOf(e.mine, e.theirs);
      state.log.unshift(e);
      emit();
      return e;
    },

    removeLog: function (id) {
      state.log = state.log.filter(function (e) { return e.id !== id; });
      emit();
    },

    exportJson: function () {
      return JSON.stringify({ app: 'osmwiz', schema: SCHEMA, exportedAt: new Date().toISOString(),
        squad: state.squad, log: state.log }, null, 2);
    },

    // Replaces everything with the file's contents, after the same migration
    // a saved payload gets. Returns an error sentence, or null.
    importJson: function (text) {
      var parsed;
      try { parsed = JSON.parse(text); } catch (e) { return 'That file is not valid JSON.'; }
      if (!parsed || parsed.app !== 'osmwiz') return 'That file is not an OSMWiz export.';
      state = migrate(parsed);
      emit();
      return null;
    }
  };

  // For tests: the same migration, without touching storage.
  OSM.store._migrate = migrate;
  OSM.store._fresh = fresh;
})(window.OSM = window.OSM || {});
