# To Do

## New options

- [x] Improve [tv-channels](./json-tv/tv-channels.json) list
    - [x] List countries in English and original language
    - [ ] Add right settings in mobile navbar panel.
- [x] Check if channels are active

---

## Improvements

### Medium

- [x] **Lint and formatting** → ESLint + Prettier configured.
- [x] **State in URL** → Sharing/restoring views via `#channels=` hash (`helperUrlState.js`).
- [x] **Errors and retries in fetch** → `fetchWithTimeout` + `AbortController` (8s timeout).
- [x] **Accessibility (a11y)** → ARIA roles, skip link, focus, keyboard access keys added.
- [ ] **IndexedDB** → More robust persistence than localStorage.
- [ ] **Register the service worker** → `pwabuilder-sw.js` exists and is referenced by the manifest/`pwa-install`, but nothing calls `.register()` in production — the app currently has no working offline cache or install-driven SW.
- [x] **CI (GitHub Actions)** → `.github/workflows/ci.yml` runs `lint`, `format:check`, and `validate:json` on push/PR.

### Medium-Low

- [ ] **Test helpers** → Validate transformations and avoid regressions. Priority: the player-slot queue in `channelUI.js` (`acquirePlayerSlot`/`releasePlayerSlot`/`STREAM_LOAD_TIMEOUT_MS`) — a hung stream that never fires `error` used to hold its slot forever and starve every queued channel behind it; a test should cover the timeout path so this can't silently regress.
- [x] **Finish Prettier pass** → Whole repo reformatted; root cause of the "63 legacy files" was CRLF checkouts vs. Prettier's LF default, not real style drift — `.gitattributes` now pins `eol=lf` so it can't recur. Lockfiles (`package-lock.json`, `pnpm-lock.yaml`) excluded from Prettier's scope — they're machine-owned and reformatting `pnpm-lock.yaml` produced a 1500-line diff for zero benefit.

### Low

- [ ] **API and helper documentation** → Only `helperUrlState.js` has JSDoc so far; extend to the other helpers.
- [ ] **Image optimization** → WebP, compression, srcset.
- [ ] **UX in “Load defaults”** → Confirmations and customization.
- [ ] **Lighthouse audit** → Run a full pass now that the a11y basics are in to catch what's left (contrast, perf).

### Optional

- [ ] **Partial migration to TypeScript** → More robustness and progressive typing.
