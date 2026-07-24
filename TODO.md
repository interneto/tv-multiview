# To Do

## Improvements

### Medium

- [ ] **IndexedDB** → More robust persistence than localStorage.
- [ ] **Register the service worker** → `pwabuilder-sw.js` exists and is referenced by the manifest/`pwa-install`, but nothing calls `.register()` in production — the app currently has no working offline cache or install-driven SW.

### Medium-Low

- [ ] **Test helpers** → Validate transformations and avoid regressions. Priority: the player-slot queue in `channelUI.js` (`acquirePlayerSlot`/`releasePlayerSlot`/`STREAM_LOAD_TIMEOUT_MS`) — a hung stream that never fires `error` used to hold its slot forever and starve every queued channel behind it; a test should cover the timeout path so this can't silently regress.

### Low

- [ ] **API and helper documentation** → Only `helperUrlState.js` has JSDoc so far; extend to the other helpers.
- [ ] **Image optimization** → WebP, compression, srcset.
- [ ] **UX in “Load defaults”** → Confirmations and customization.
- [ ] **Lighthouse audit** → Run a full pass now that the a11y basics are in to catch what's left (contrast, perf).

### Optional

- [ ] **Partial migration to TypeScript** → More robustness and progressive typing.
