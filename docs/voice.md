# OSMWiz: Voice

These rules govern every word a reader sees: page text, labels, buttons,
headings, dialogs, empty states, tooltips and share text. They come from
FHCWiz, a sibling companion, where each one was a fault found in shipped copy.
[`brand/BRAND-GUIDE.md`](brand/BRAND-GUIDE.md) §3–§5 sets OSMWiz's own voice,
the game's vocabulary and copy style; this file lists the faults that voice
must not slide into. Sections marked *checked* have a tripwire in
`tools/voice-check.js`.

## 1. Defending the data against an accusation nobody made (*checked*)

*Scraped*, *estimated*, *guesswork* and *honest* only appear when someone is
answering a charge, so a reader who had no doubt now has one. Claim a good
property once, as a flat label, and never argue it. If a caveat changes what a
reader should do, give them the instruction and drop the bookkeeping. How a
number got here belongs in `CHANGELOG.md`, `docs/` and comments beside the data.

Labelling certainty is not defending it. The *Game rule* and *Community figure*
chips, and "Managers report…", are claims (brand §3). An empty row that says
"Not enough matches yet" is the honest content of that row, not a confession.

## 2. Internal vocabulary on screen (*checked in part*)

Every noun on screen is one the manager has already read in the game or in the
app's own tabs; brand §4 is the list. Money is **Club funds** and **Boss Coins**,
never cash, gems or coins alone (*checked*). Where the app works out a value the
game never shows, show the value the game shows, or nothing: an internal figure
on screen invites the reader to check our arithmetic against a number they have
never seen.

## 3. Admiring the mechanism instead of the outcome (*checked in part*)

Say what the reader does and what they get, with the reader as the subject:
*Add your squad*, not *the tool tracks your squad*. Cut any phrase that ranks
or praises our own work ("the one number that matters"), the app apologising
for itself ("the app cannot…"), and stock phrasing such as "unlock your squad's
full potential" or "coming soon" (brand §3, the Don't column).

## 4. Positioning on the wrong thing (*checked in part*)

Lead with what the thing is. Never upsell or advise buying Boss Coins, and
never suggest we are official (brand §3, §12). A Boss Coin cost is an input to
the calculator that needs it, mentioned there and nowhere else.

## 5. Precision that narrows the promise and expires

An exact count in prose is wrong after the next update and invites a judgement
on whether it is a lot. Exact numbers live in tiles, tables and the data. Prose
rounds down from what is actually held, or names the thing instead of counting
it. Rounding is not inflation: never round past what the data supports. State
the promise at the width of the product, not of what is finished.

## 6. Naming our own files (*checked*)

Never name a file, a path, an extension or a storage key in anything a reader
sees: not `js/store.js`, not `osmwiz-v1`, not `localStorage`. Say what happened
("saved in this browser"), or link the thing under a name a reader knows ("the
privacy page"). Commit messages, `CHANGELOG.md`, `docs/` and code comments are
written for maintainers and are exempt.

## House style

- **One clause.** Subject, verb, object. Every cut clause in FHCWiz's rewrites
  was a defence, an aside or a boast.
- **No em-dash asides in UI copy** (*checked*). Make it two sentences or cut
  the aside. A dash as a title separator, or alone for an empty value, is fine.
- **No "actually"** doing defensive work against an unstated alternative.
- **Standfirsts describe; they don't sell.** Buttons are verbs the manager would say.
- **British football English**, as the game writes it (brand §3). A player's or
  club's name keeps its own spelling.

## The tripwire

`tools/voice-check.js` reads the visible text of the pages and the string
literals in `js/`, skipping tests, comments and console output, and prints
`file:line`, the fault and what to do. When it fires, rewrite the sentence for
the reader. If a word genuinely belongs, add it to `ALLOWED` in the tool with a
reason; an allowed phrase is matched against one sentence, never a whole page,
or one exception would hide every other fault beside it. §5 and most of §3 and
§4 have no mechanical signature and still need reading. Prove a new rule by
putting the bad sentence back: a check that has never failed proves nothing.
