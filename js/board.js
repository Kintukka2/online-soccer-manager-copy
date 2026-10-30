(function (OSM) {
  'use strict';

  // The tactics board: our half of the visual system (docs/brand). A white
  // melamine board with printed lines, magnets and marker. It explains; it
  // never shows a number the game owns, so a magnet carries a position code
  // at most. Pure string builders, so tests.html can check the markup.

  var INK = '#1C2733';
  var LINE = '#C5D0C9';
  var OURS = '#FF3D7F';
  var THEIRS = '#13233A';

  function magnet(x, y, r, fill) {
    var sh = r * 0.2;
    return '<circle cx="' + (x + sh).toFixed(2) + '" cy="' + (y + sh).toFixed(2) + '" r="' + r + '" fill="rgba(0,0,0,.2)"/>' +
      '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + r + '" fill="' + fill + '" stroke="#fff" stroke-width="' + (r * 0.24).toFixed(2) + '"/>';
  }

  // A portrait pitch, own goal at the bottom, 68 by 100 units.
  function pitch() {
    return '<g fill="none" stroke="' + LINE + '" stroke-width="0.8">' +
      '<rect x="3" y="3" width="62" height="94"/><path d="M3 50 H65"/>' +
      '<circle cx="34" cy="50" r="8"/><rect x="18" y="3" width="32" height="14"/>' +
      '<rect x="18" y="83" width="32" height="14"/></g>';
  }

  // Where each line stands, from the keeper up.
  var ROWS = { G: 90, D: 74, M: 50, A: 24 };

  function rowX(i, n) {
    return 6 + (i + 0.5) * (56 / n);
  }

  // Magnets for one formation. Midfield codes are printed where the game's
  // own layout for that variant is known; elsewhere the magnets stand bare.
  function formation(code, variant, opts) {
    var o = opts || {};
    var counts = OSM.engine.counts(code);
    var f = OSM.data.formation(code);
    var mids = f && f.mid ? f.mid[variant === 'B' ? 'B' : 'A'] : null;
    var r = o.small ? 4.2 : 3.6;
    var out = [];
    ['G', 'D', 'M', 'A'].forEach(function (line) {
      var n = counts[line];
      for (var i = 0; i < n; i++) {
        var x = rowX(i, n);
        out.push(magnet(x, ROWS[line], r, OURS));
        if (!o.small && line === 'M' && mids && mids[i]) {
          out.push('<text x="' + x.toFixed(2) + '" y="' + (ROWS[line] + r + 4.4).toFixed(2) +
            '" text-anchor="middle" font-size="3.4" font-weight="700" fill="' + INK + '">' + mids[i] + '</text>');
        }
      }
    });
    var label = (f ? f.name : code) + (variant ? ' ' + variant : '');
    return '<svg viewBox="0 0 68 100" role="img" aria-label="' + label + ' on the tactics board">' +
      pitch() + out.join('') + '</svg>';
  }

  // The empty state: the pitch with magnets parked along the bottom edge,
  // ours left and theirs right, waiting to be placed.
  function empty() {
    var parked = [];
    for (var i = 0; i < 5; i++) parked.push(magnet(8 + i * 5.5, 104, 2.4, OURS));
    for (var j = 0; j < 5; j++) parked.push(magnet(38 + j * 5.5, 104, 2.4, THEIRS));
    return '<svg viewBox="0 0 68 110" role="img" aria-label="An empty tactics board">' + pitch() + parked.join('') + '</svg>';
  }

  OSM.board = { formation: formation, empty: empty, magnet: magnet };
})(window.OSM = window.OSM || {});
