# To Do

## Improvements

### Medium

- [x] **Automate channel maintenance** → `.github/workflows/channels-maintenance.yml` runs the chain weekly (Mondays 05:00 UTC, plus `workflow_dispatch`) and opens a PR with the diff. Order matters and is encoded there: health check → CORS check → YouTube fallbacks → https upgrade → prune. The merge step runs before the prune so a channel that gains a fallback survives instead of being retired.
- [x] **IndexedDB** → `helpers/helperIdbStore.js` is a tiny key/value store over IndexedDB with a localStorage fallback; the channel catalog backup lives there now (`channels-backup`) and the old `backup-json-canales` keys are migrated and deleted on first save. Frees the localStorage quota that the user's preferences share. `clearChannelBackup()` is wired into both reset buttons, since `localStorage.clear()` does not touch IndexedDB.
- [x] **Register the service worker** → `index.html` registers `pwabuilder-sw.js` on `load` (never on localhost, where the dev block above it unregisters). Registration used to depend solely on the `<pwa-update>` component fetched from a CDN; if that import failed the installed PWA had no offline cache at all.

### Medium-Low

- [x] **Test helpers** → 19 tests, `node --test`.
    - The player-slot queue moved out of `channelUI.js` into `helpers/helperPlayerSlots.js` so it can be tested without a DOM: `test/playerSlots.test.mjs` covers the hand-off to a queued channel, the idempotent `release()` (one player must never free two slots), and the hung-stream path where the load timeout has to return the slot.
    - `test/playerSizing.test.mjs` guards the `fluid` vs `fill` regression. A real height assertion needs layout, and jsdom reports 0 for every box, so a height test there would be a false green; instead the test pins the option combination that caused the bug. The rendered height was verified in a real browser: all nine default tiles report a 305×303 box with players playing.

### Low

- [x] **API and helper documentation** → every function in `assets/js/helpers/` now has a JSDoc block with params, return and — where it matters — the reason the code is written that way.
- [x] **Image optimization** → PWA screenshots converted to WebP (1.90 MB → 244 KB, −87%) and the manifest updated with `type`, `label` and `form_factor`. The preview images were still named `shots_teles_*` while `index.html` pointed at `shots_tv-multiview_*`, so both social preview tags were broken: files renamed and the URLs made absolute. Country flags in the channel lists load with `loading="lazy" decoding="async"`, and the logo carries explicit `width`/`height`.
- [x] **UX in "Load defaults"** → loading the defaults used to wipe the current grid with no warning. It now asks first (only when there is something to lose) and offers two outcomes: replace the selection, or add just the missing channels. Built on `helpers/helperConfirmDialog.js`, a reusable multi-action Bootstrap dialog.
- [x] **Lighthouse audit** → full pass run against a local build (Chromium headless, Lighthouse 12). Accessibility 87 → 95 after fixing: the overlay "official page" link lost its accessible name whenever the overlay text was hidden (now `aria-label`), the channel-selector button's `aria-label` did not contain its visible text, and the language buttons sat at 3.6:1 contrast (below AA) in dark and ~4.0:1 in light.
    - Still open, and out of our hands: `image-alt` comes from the `pwa-install` component, which renders the manifest screenshots in its own shadow DOM without `alt` (adding `label` to the manifest did not change it), and `font-size` comes from video.js's stylesheet.
    - The performance score from that run (19) is not representative: it was measured on `python -m http.server` over plain http with nine live streams playing, so text compression, HTTP/2, cache headers and https all failed for reasons that do not apply on GitHub Pages. What is worth attacking there is real, though: CLS 0.577 (web-font swap) and ~12.9 s of render-blocking CDN CSS.
- [x] **Keyboard-accessible reorder** → the overlay "Move" button now responds to the arrow keys (`helpers/helperKeyboardReorder.js`): it moves the tile one position, keeps focus so moves can be chained, and saves the new order. Drag-and-drop is untouched; both gestures share the same control, and the tooltip mentions it.
- [x] **`cnbc` default stream is `http://`** → solved across the whole catalog rather than one channel: `tools/upgrade_insecure_streams.js` probes the https twin of every plain-http URL, upgrades it when it answers (10 channels) and drops it when it does not. `cnbc`'s dead `http://` link is gone and the tile now goes straight to its YouTube fallback.

### Optional

- [ ] **Partial migration to TypeScript** → More robustness and progressive typing. The JSDoc pass above is the groundwork: with `checkJs` most helpers would already type-check.

## Known limits

- **The health check cannot see CORS.** `report_status_channels.js` asks "does the server answer?" from Node, which never applies the same-origin policy. A server can answer 200 and still be useless in the browser if it does not send an `Access-Control-Allow-Origin` the site can use — that is why `skynews` and `bbearth` shipped as defaults while never playing a frame. `tools/check_cors_channels.js` covers that gap (it sends the published site's `Origin`), and `prune_dead_channels.js` treats a CORS-blocked stream as dead.
- **Pluto TV streams echo only allow-listed origins.** They work from `localhost` and return `http://pluto.tv` for anything else, so they are blocked on the published site. Verifying a stream from a local dev server is not proof it works in production.
