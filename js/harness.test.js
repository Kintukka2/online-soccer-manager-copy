(function (OSM) {
  'use strict';

  // The shared test kit. Loaded first by tests.html and never published
  // (tools/build-site.js skips *.test.js). Each suite registers with test();
  // tests.html calls OSM.runTests() once every suite has loaded.

  var results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, pass: true });
    } catch (e) {
      results.push({ name: name, pass: false, message: e && e.message ? e.message : String(e) });
    }
  }

  function eq(actual, expected, what) {
    if (actual !== expected) {
      throw new Error((what || 'value') + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    }
  }

  function ok(v, what) {
    if (!v) throw new Error((what || 'value') + ': expected truthy, got ' + JSON.stringify(v));
  }

  function near(actual, expected, tol, what) {
    if (Math.abs(actual - expected) > (tol == null ? 0.01 : tol)) {
      throw new Error((what || 'value') + ': expected ~' + expected + ', got ' + actual);
    }
  }

  function deepEq(actual, expected, what) {
    eq(JSON.stringify(actual), JSON.stringify(expected), what);
  }

  function count(haystack, needle) {
    return haystack.split(needle).length - 1;
  }

  OSM.t = { test: test, eq: eq, ok: ok, near: near, deepEq: deepEq, count: count };
  OSM.runTests = function () { return results; };
})(window.OSM = window.OSM || {});
