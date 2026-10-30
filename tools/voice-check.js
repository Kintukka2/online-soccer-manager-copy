#!/usr/bin/env node
// Scans the copy a reader sees for the faults in docs/voice.md that have a
// mechanical signature.
//
// Two kinds of source: the visible text of the pages (every root *.html but
// the test harness), and the string literals of the app's scripts (js/*.js,
// not the *.test.js beside them). Both are read as text rather than run,
// which is less precise than evaluating them but catches the words, and the
// words are the signature.
//
// Comments are skipped on purpose. Every one of these words can do honest
// work in a comment or in docs/: "estimated from logged matches" is how a
// number got here, which is exactly what a maintainer needs to know and a
// reader does not.
//
// A literal counts as copy only if it reads like words: it has a space in
// it, or it is a capitalised word (a label). 'osmwiz-v1', 'sw.js' and
// 'css/styles.css' are code, and code is allowed to name files and keys;
// 'Saved in osmwiz-v1' is a sentence, and a sentence is not. Arguments to
// console.* are skipped too: the console is for whoever maintains this.
//
// Usage: node tools/voice-check.js
//
// The rules are exported, so other copy can be held to the same ones without
// a second list that would drift from this one. Requiring this file only
// reads the rules; the scan runs when it is run directly.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// One rule per fault with a mechanical signature. The `why` is what gets
// printed, so it says what to do rather than what was found. The numbers are
// the sections of docs/voice.md.
//
// FHCWiz's rule against the word "board" is deliberately not here: in OSM a
// tactics board and the club's Board are both real things, and the brand
// draws our analysis on one. Its American-spelling rule is gone too, because
// this game writes British football English (BRAND-GUIDE.md §3).
const RULES = [
  {
    id: '§1 defends the data',
    re: /\b(scraped|scraping|estimated|guesswork|nothing to scrape|honest|honestly)\b/i,
    why: 'cut the defence; keep the instruction if there is one in it'
  },
  {
    id: '§1 narrates how the data got here',
    re: /\b(rather than guessing|taking on trust|final rather than provisional|we (recorded|flagged|filed|captured))\b/i,
    why: 'this belongs in CHANGELOG.md or a comment, not on the page'
  },
  {
    id: '§2 not the game\'s word for money',
    re: /\b(cash|gems?)\b|(?<!\bboss\s)\bcoins?\b/i,
    why: 'the game says Club funds and Boss Coins (BC), never cash, gems or coins alone'
  },
  {
    id: '§3 apologises for the tool',
    re: /\bthe (tool|app|site|calculator|planner|optimi[sz]er) (has no|cannot|is unable)\b/i,
    why: 'say what the reader does and what they get'
  },
  {
    id: '§3 ranks its own points',
    re: /\b(worth being clear about|worth naming up front|the one number that matters)\b/i,
    why: 'cut the phrase that praises the point and keep the point'
  },
  {
    id: '§3 stock phrasing',
    re: /\b(unlock (your|the|their) ((squad|team|club)['’]?s? )?(full )?potential|to the next level|game[- ]chang(er|ing)|look no further|seamless(ly)?|supercharge[sd]?|unleash(es|ed)?|elevate your|delve|in today['’]s|coming soon|level up your)\b/i,
    why: 'say what the reader does and what they get, in words a manager would use'
  },
  {
    id: '§4 official framing or an upsell',
    re: /\b(the|an) official (OSM |Online Soccer Manager )?(companion|app|site|tool|guide)\b|\b(buy|buying|purchase) (more |some )?Boss Coins\b/i,
    why: 'we are an unofficial companion, and we never advise buying Boss Coins'
  },
  {
    id: '§6 names one of our own files',
    re: /\b[\w.-]+\.(md|js|css|json|csv|html)\b|\b(docs|tools|js|css)\//,
    why: 'say what happened, not which file it went into'
  },
  {
    id: '§6 names a storage key',
    re: /\blocalStorage\b|\bosmwiz-[\w-]+/,
    why: 'say "saved in this browser"; the key name is ours, not the reader\'s'
  },
  {
    // A dash between two words that carries on in lower case is an aside. A
    // title separator ("Page not found — OSMWiz") goes on in capitals, and
    // a dash standing alone for an empty value has no words either side.
    id: 'house style: em-dash aside',
    re: /\w[)'’"”]?\s*—\s*[a-z]/,
    why: 'make it two sentences, or cut the aside; in UI copy an aside is nearly always a caveat'
  }
];

// Strings that carry one of the words for a reason. Each needs a why, and
// "it reads better" is not one. Matched against a single sentence, never a
// whole page: an allowed phrase matched against a page whitelists every other
// fault on it, which is how FHCWiz shipped "Solve a board" past this check.
const ALLOWED = [];

// A phrase is allowed by its words, not by how they are bound: copy carries
// &nbsp; between the last two words of a paragraph so no line ends with one
// word alone, and that is not a change of phrase.
function words(line) {
  return String(line).replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function allowed(line) {
  const plain = words(line);
  return ALLOWED.some((s) => plain.includes(words(s)));
}

/* ---------- visible text ---------- */

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—',
  ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“',
  rdquo: '”', middot: '·', lsaquo: '‹', rsaquo: '›', times: '×'
};

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] !== '#') return NAMED[e.toLowerCase()] || m;
    const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
  });
}

// Tags that sit inside a sentence. Every other tag ends one, so a heading
// does not run on into the paragraph under it.
const INLINE = /^<\/?(a|abbr|b|bdi|br|code|em|i|kbd|mark|q|s|small|span|strong|sub|sup|time|u)\b/i;
const BREAK = '\u0001';

// The text a reader sees in some markup, as runs with their offsets into it.
// Comments, scripts, styles and tags are blanked to spaces rather than
// removed, so every offset still points at the same character (and the same
// line). A half tag at either end is a fragment of markup built up in a
// script, and is blanked too.
function visibleRuns(src) {
  const runs = [];
  // Attribute values a reader sees: a tooltip, alt text, a label, a hint.
  for (const m of src.matchAll(/\s(?:title|alt|aria-label|placeholder)\s*=\s*"([^"]*)"/gi)) {
    runs.push({ at: m.index + m[0].indexOf('"') + 1, text: m[1] });
  }
  // What a search result or a shared link shows.
  for (const m of src.matchAll(/<meta\s[^>]*>/gi)) {
    if (!/(?:name|property)\s*=\s*"(?:description|og:title|og:description|og:image:alt)"/i.test(m[0])) continue;
    const c = m[0].match(/\scontent\s*=\s*"([^"]*)"/i);
    if (c) runs.push({ at: m.index + c.index + c[0].indexOf('"') + 1, text: c[1] });
  }
  const flat = src.replace(
    /<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<[^>]*>|<[^>]*$|^[^<]*>/gi,
    (m) => {
      const blank = m.replace(/[^\n]/g, ' ');
      return INLINE.test(m) || blank[0] === '\n' ? blank : BREAK + blank.slice(1);
    });
  let at = 0;
  flat.split(BREAK).forEach((text) => {
    runs.push({ at, text });
    at += text.length + 1;
  });
  return runs;
}

// Sentences with their offsets, split where a full stop, question or
// exclamation mark is followed by a space.
function sentenceSpans(text) {
  const out = [];
  const sep = /(?<=[.!?])\s+/g;
  let last = 0;
  const take = (end) => {
    const raw = text.slice(last, end);
    const clean = decode(raw).replace(/\s+/g, ' ').trim();
    if (/[A-Za-z]/.test(clean)) {
      out.push({ offset: last + raw.length - raw.trimStart().length, text: clean });
    }
  };
  let m;
  while ((m = sep.exec(text)) !== null) {
    take(m.index);
    last = m.index + m[0].length;
  }
  take(text.length);
  return out;
}

function sentencesOf(text) {
  return visibleRuns(text).flatMap((r) => sentenceSpans(r.text).map((s) => s.text));
}

// Every rule a piece of copy breaks, unless an allowed phrase covers it.
function faultsIn(text) {
  return sentencesOf(text).flatMap((s) => (allowed(s) ? [] : RULES.filter((r) => r.re.test(s))));
}

module.exports = { RULES, ALLOWED, allowed, faultsIn, sentencesOf };

if (require.main !== module) return;

/* ---------- string literals ---------- */

function unescapeJs(s) {
  return s.replace(/\\(u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|\r?\n|[\s\S])/g,
    (m, all, cp, u, x) => {
      if (cp) return String.fromCodePoint(parseInt(cp, 16));
      if (u) return String.fromCharCode(parseInt(u, 16));
      if (x) return String.fromCharCode(parseInt(x, 16));
      if (all === 'n' || all === 't') return ' ';
      if (all === '\n' || all === '\r\n') return '';
      return all;
    });
}

// Every string literal in a script, with the line it starts on. A small
// tokenizer rather than a regex over the source, because a regex cannot tell
// a quote that opens a string from one inside a comment, a regex literal or
// another string: one "don't" in a comment is enough to pair the wrong
// quotes. A ${...} inside a template is read as code, so the strings inside
// it are found too, and stands in the text as an ellipsis.
function scriptStrings(src) {
  const out = [];
  let i = 0;
  let line = 1;

  function skipTo(stop) {
    for (; i < stop; i++) if (src[i] === '\n') line++;
  }

  function regexAllowed() {
    let k = i - 1;
    while (k >= 0 && /\s/.test(src[k])) k--;
    if (k < 0 || /[(,=:[!&|?{};+\-*%<>~^]/.test(src[k])) return true;
    const word = src.slice(Math.max(0, k - 9), k + 1).match(/[A-Za-z]+$/);
    return !!word && /^(return|typeof|case|in|of|delete|void|throw|new|else|do)$/.test(word[0]);
  }

  function regex() {
    let inClass = false;
    for (i++; i < src.length && src[i] !== '\n'; i++) {
      if (src[i] === '\\') { i++; continue; }
      if (src[i] === '[') inClass = true;
      else if (src[i] === ']') inClass = false;
      else if (src[i] === '/' && !inClass) { i++; break; }
    }
    while (i < src.length && /[a-z]/i.test(src[i])) i++;
  }

  function literal(quote) {
    const start = { line, from: i, template: quote === '`' };
    let text = '';
    for (i++; i < src.length && src[i] !== quote; ) {
      if (src[i] === '\\') {
        if (src[i + 1] === '\n') line++;
        text += src.substr(i, 2);
        i += 2;
      } else if (quote === '`' && src[i] === '$' && src[i + 1] === '{') {
        i += 2;
        code(true);
        text += '…';
      } else if (src[i] === '\n' && quote !== '`') {
        break;                      // an unterminated string: stop at the line
      } else {
        if (src[i] === '\n') line++;
        text += src[i++];
      }
    }
    i++;
    out.push({ line: start.line, from: start.from, template: start.template, text: unescapeJs(text) });
  }

  // Code, until the end of the source or, inside a ${, the brace that closes it.
  function code(inside) {
    let depth = 0;
    while (i < src.length) {
      const c = src[i];
      const n = src[i + 1];
      if (c === '/' && n === '/') {
        const end = src.indexOf('\n', i);
        skipTo(end === -1 ? src.length : end);
      } else if (c === '/' && n === '*') {
        const end = src.indexOf('*/', i + 2);
        skipTo(end === -1 ? src.length : end + 2);
      } else if (c === '\'' || c === '"' || c === '`') {
        literal(c);
      } else if (c === '/' && regexAllowed()) {
        regex();
      } else {
        if (c === '\n') line++;
        if (c === '{') depth++;
        if (c === '}' && depth-- === 0 && inside) { i++; return; }
        i++;
      }
    }
  }

  code(false);
  return out;
}

/* ---------- scan ---------- */

const problems = [];
const report = (file, line, text) => {
  if (allowed(text)) return;
  RULES.forEach((rule) => {
    if (rule.re.test(text)) problems.push({ file, line, rule, text: text.slice(0, 140) });
  });
};
const lineAt = (src, offset) => src.slice(0, offset).split('\n').length;

const PAGES = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && f !== 'tests.html')
  .sort();

PAGES.forEach((rel) => {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  visibleRuns(src).forEach((run) => {
    sentenceSpans(run.text).forEach((s) => report(rel, lineAt(src, run.at + s.offset), s.text));
  });
});

const JS = path.join(ROOT, 'js');
const SCRIPTS = fs.existsSync(JS)
  ? fs.readdirSync(JS).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js')).sort()
    .map((f) => 'js/' + f)
  : [];
if (!SCRIPTS.length) {
  console.log('voice-check: no scripts in js/ yet, so only the pages were read');
}

SCRIPTS.forEach((rel) => {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  scriptStrings(src).forEach((lit) => {
    if (/console\.\w+\(\s*$/.test(src.slice(Math.max(0, lit.from - 40), lit.from))) return;
    visibleRuns(lit.text).forEach((run) => {
      // Copy reads like words: a space in it, or a capitalised label.
      if (!/[A-Za-z]/.test(run.text) || !(/\s/.test(run.text) || /^[A-Z]/.test(run.text))) return;
      sentenceSpans(run.text).forEach((s) => {
        // Only a template literal's own newlines are lines of the file.
        const down = lit.template ? lit.text.slice(0, run.at + s.offset).split('\n').length - 1 : 0;
        report(rel, lit.line + down, s.text);
      });
    });
  });
});

const scanned = PAGES.length + SCRIPTS.length;
if (!problems.length) {
  console.log('voice-check: ' + scanned + ' files clean against docs/voice.md');
  process.exit(0);
}

console.error('voice-check: ' + problems.length + ' to look at\n');
problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
problems.forEach((p) => {
  console.error('  ' + p.file + ':' + p.line + '  [' + p.rule.id + ']');
  console.error('    "' + p.text + '"');
  console.error('    -> ' + p.rule.why + '\n');
});
console.error('Rewrite for the reader rather than working around the pattern.');
console.error('If a word belongs, add it to ALLOWED in this file with a reason.');
process.exit(1);
