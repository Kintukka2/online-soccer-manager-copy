(function (OSM) {
  'use strict';

  // Event wiring, routing and boot. The only file that touches the page.

  var ui = OSM.ui;
  var store = OSM.store;
  var view = document.getElementById('view');

  var ROUTES = {
    '': { title: 'OSMWiz: Squad Strength, Tactics and Calculators for Online Soccer Manager', render: ui.home },
    squad: { title: 'Squad strength · OSMWiz', render: ui.squad },
    tactics: { title: 'Tactics · OSMWiz', render: ui.tactics },
    calculators: { title: 'Calculators · OSMWiz', render: ui.calculators },
    log: { title: 'Match log · OSMWiz', render: ui.matchLog },
    about: { title: 'About · OSMWiz', render: ui.about }
  };

  function current() {
    var h = (location.hash || '').replace(/^#\/?/, '').split('/')[0];
    return ROUTES[h] ? h : '';
  }

  // Re-rendering replaces the inputs, so whatever had focus is found again by
  // its data-focus key and given focus back, caret and all. Without this,
  // every edit in the squad table would throw the reader out of the field.
  function render(keepFocus) {
    var route = current();
    var active = document.activeElement;
    var key = keepFocus && active && active.getAttribute && active.getAttribute('data-focus');
    var caret = null;
    try { caret = key && typeof active.selectionStart === 'number' ? active.selectionStart : null; } catch (e) { caret = null; }

    view.innerHTML = ROUTES[route].render(store.getState());
    document.title = ROUTES[route].title;
    document.querySelectorAll('.topbar nav a').forEach(function (a) {
      var on = a.getAttribute('data-route') === route;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    if (key) {
      var again = view.querySelector('[data-focus="' + key + '"]');
      if (again) {
        again.focus();
        try { if (caret !== null) again.setSelectionRange(caret, caret); } catch (e) { /* selects and number fields have no caret */ }
      }
    }
  }

  function focusKey(key) {
    var el = view.querySelector('[data-focus="' + key + '"]');
    if (el) el.focus();
  }

  window.addEventListener('hashchange', function () {
    render(false);
    window.scrollTo(0, 0);
  });

  // Deferred a tick. A change event fires while Tab is still moving focus,
  // and redrawing then would replace the field the browser is moving to, so
  // focus would land on nothing. One tick later focus has landed, and render
  // can find the new copy of wherever it landed. Several changes in one tick
  // share one redraw.
  var pending = false;
  store.subscribe(function () {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      var route = current();
      if (route === 'squad' || route === 'log' || route === 'about') render(true);
    }, 0);
  });

  /* ---------- changes ---------- */

  view.addEventListener('change', function (e) {
    var t = e.target;
    var action = t.getAttribute('data-action');
    if (action === 'formation') {
      store.setFormation(t.value.slice(0, 3), t.value.slice(3));
    } else if (action === 'player') {
      store.claimSquad();
      store.updatePlayer(t.getAttribute('data-id'), t.getAttribute('data-field'), t.value);
    } else if (action === 'import') {
      importFile(t);
    }
  });

  /* ---------- clicks ---------- */

  view.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var action = t.getAttribute('data-action');
    if (action === 'remove-player') {
      store.claimSquad();
      store.removePlayer(t.getAttribute('data-id'));
    } else if (action === 'clear-squad') {
      store.clearSquad();
      focusKey('add-name');
    } else if (action === 'load-example') {
      store.loadExample();
    } else if (action === 'pick-formation') {
      store.setFormation(t.getAttribute('data-code'), store.getState().squad.variant);
    } else if (action === 'remove-log') {
      store.removeLog(t.getAttribute('data-id'));
    } else if (action === 'export') {
      exportFile();
    }
  });

  /* ---------- forms ---------- */

  view.addEventListener('submit', function (e) {
    var form = e.target;
    e.preventDefault();
    var action = form.getAttribute('data-action');
    var f = form.elements;
    if (action === 'add-player') {
      if (!f.att.value && !f.def.value && !f.name.value) { focusKey('add-name'); return; }
      store.claimSquad();
      store.addPlayer({ name: f.name.value, position: f.position.value, att: f.att.value, def: f.def.value });
      focusKey('add-name');
    } else if (action === 'add-log') {
      store.addLog({
        date: f.date.value, opponent: f.opponent.value, venue: f.venue.value,
        formation: f.formation.value, plan: f.plan.value, tackling: f.tackling.value,
        theirFormation: f.theirFormation.value, referee: f.referee.value,
        mine: f.mine.value, theirs: f.theirs.value
      });
    }
  });

  // Calculators answer as you type, and only their result box is redrawn,
  // so the field being typed in is never replaced.
  view.addEventListener('input', function (e) {
    var form = e.target.closest('form[data-calc]');
    if (!form) return;
    calculate(form);
  });
  view.addEventListener('change', function (e) {
    var form = e.target.closest('form[data-calc]');
    if (form) calculate(form);
  });

  function calculate(form) {
    var id = form.getAttribute('data-calc');
    var values = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) values[el.name] = el.value; });
    var out = form.querySelector('[data-out="' + id + '"]');
    if (out && ui.calcOut[id]) out.innerHTML = ui.calcOut[id](values);
  }

  /* ---------- export and import ---------- */

  function status(text) {
    var el = document.getElementById('io-status');
    if (el) el.textContent = text;
  }

  function exportFile() {
    var blob = new Blob([store.exportJson()], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'osmwiz-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    status('Exported your squad and match log.');
  }

  function importFile(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var error = store.importJson(String(reader.result || ''));
      status(error || 'Imported. Your squad and match log are replaced with the file’s.');
    };
    reader.onerror = function () { status('That file could not be read.'); };
    reader.readAsText(file);
  }

  /* ---------- boot ---------- */

  render(false);

  // Offline support on the published site only: a service worker needs a
  // real origin, and a stale one on localhost would get in the way of work.
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* the app works without it */ });
  }
})(window.OSM = window.OSM || {});
