# Versioning policy

OSMWiz follows [Semantic Versioning 2.0.0](https://semver.org/), adapted for an
application rather than a library. Read this before cutting a release.

## `MAJOR.MINOR.PATCH`

SemVer is written for libraries, where "breaking change" means breaking a public
API. This app has no API and no downstream consumers, so that definition needs
replacing with one that means something here.

**The compatibility contract of this app is the reader's saved data**, not its
code. Concretely:

- what `js/store.js` keeps in `localStorage` under the `osmwiz-*` keys (today
  one key, `osmwiz-v1`: the squad and the match log), and
- the JSON produced by **Export** and consumed by **Import**.

Everything else (function signatures, the shape of `OSM.engine`, CSS class
names) is free to change at any time. Nothing outside this repo depends on it.

### MAJOR: saved data will not survive

Bump when an upgrade **cannot** carry an existing squad or match log forward:

- a storage change that `migrate()` in `js/store.js` cannot handle
- an export format change that makes older export files unreadable
- deliberately dropping saved data, or requiring the reader to re-enter it

MAJOR is not about how large the change feels: a total redesign that keeps
every saved player is MINOR; deleting one field that cannot be migrated is
MAJOR. **Prefer writing a migration over bumping MAJOR.** `migrate()` exists so
that shape changes stay MINOR.

### MINOR: new capability, data intact

Anything a reader can notice that does not cost them data: a new calculator,
tab or tactic; a storage change `migrate()` handles transparently; redesigns,
relabelling and workflow changes; removing a feature whose absence does not
invalidate saved data.

### PATCH: corrections only

Fixes that change no intended behaviour and add no capability: wrong maths, a
wrong game figure, layout and rendering bugs, performance, comments, docs and
test-only changes. If a PATCH entry says "and also added…", it is a MINOR.

## While in `0.x`

The rules are looser by design: **MINOR may break saved data during `0.x`**,
because the schema is still settling. The obligation is disclosure, not
stability: if a release destroys or reshapes saved data, say so at the top of
its changelog entry, so nobody discovers it by surprise.

Cut `1.0.0` once the storage shape has gone a few releases without a breaking
change and the app has been used for real across a full OSM season. From then
on the MAJOR rule is a hard guarantee.

## Where the version lives

The single source of truth is `OSM.data.VERSION` in `js/data.js`, the only
place the number is written by hand (there is no `package.json`). Every page
carries it once per asset URL (`js/app.js?v=0.1.0`) and `sw.js` carries it in
its cache name, but `tools/stamp-assets.js` writes those, reading the number
through `tools/version.js`.

> **Any change to `js/` or `css/` needs a version bump before it ships**, a
> one-line fix included. `_headers` caches the stamped URLs for a year as
> `immutable`, so changed code under an unchanged version reaches new visitors
> and never reaches anyone who has opened the site before. The version is not
> bookkeeping you do at the end; it is half of the cache mechanism.

Three things must agree: `OSM.data.VERSION`, the newest released heading in
`CHANGELOG.md`, and the git tag. If they disagree, the tag wins: it is the only
one that is immutable.

## Tags

`vX.Y.Z`, matching the changelog heading exactly (`v0.2.0`, not `0.2.0`).
Releases are published from the repository's **Releases** page on GitHub,
which creates a lightweight tag on the commit you target: the merge commit of
the release's pull request. Take the date from the merge, not the calendar.
Write the release notes for managers: what changed in the app, and anything
they need to know about their saved data.

**Never move or delete a published tag.** Supersede it with a new version.

## The storage key is not the version

The `v1` in `osmwiz-v1` is **not** the app version and does not track it. The
payload carries its own `schema` number, which `migrate()` reads, and that is
what moves when the saved shape changes. The key changes only for a clean break
so large `migrate()` cannot bridge it, which should be close to never: a new
key orphans every saved squad on every reader's device. For the same reason the
`osmwiz-` prefix stays whatever the brand is called later.

## Release checklist

1. Confirm the suite is green: `node tools/run-tests.js` (CI runs it on every
   push, so it should already be).
2. Decide the bump using the rules above, and update `OSM.data.VERSION`.
3. Re-stamp the pages and the precache list, then confirm:
   ```sh
   node tools/stamp-assets.js
   node tools/stamp-assets.js --check
   ```
4. Check the copy and the build: `node tools/voice-check.js`, then
   `node tools/build-site.js`.
5. In `CHANGELOG.md`, retitle `[Unreleased]` to the new version and open a
   fresh empty `[Unreleased]` above it. Date it the day the merge will land.
6. Push the branch, open a pull request, and merge it once CI is green.
7. Publish the release from the **Releases** page: tag `vX.Y.Z` on the merge
   commit, notes written for managers. Publishing creates the tag.
8. Check the three records agree. If the heading disagrees with the tag, the
   heading moves.

## Changelog discipline

Group entries under `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated` and
`Security`, per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Write for the manager deciding whether to upgrade, not for whoever wrote the
code. Anything touching saved data gets called out in its entry, every time.
