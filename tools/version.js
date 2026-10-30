// The app version, read from the one place it is allowed to live.
//
// js/data.js holds VERSION and nothing else may declare it (see VERSIONING.md).
// Every tool that needs it reads it through here, because a second copy of
// this five-line read is exactly how a second source of truth starts.
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'js', 'data.js');

module.exports = function version() {
  // A clean message rather than a stack trace: on a fresh checkout, or while
  // the app is still being written, this is the first thing that is missing.
  if (!fs.existsSync(FILE)) {
    console.error('version: js/data.js does not exist, so there is no version to read.');
    process.exit(1);
  }
  const found = fs.readFileSync(FILE, 'utf8').match(/VERSION:\s*'([^']+)'/);
  if (!found) {
    console.error('version: no VERSION found in js/data.js — has it moved?');
    process.exit(1);
  }
  return found[1];
};
