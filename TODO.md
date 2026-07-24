# To Do

## Improvements

### Medium

- [ ] **Automate channel maintenance** → `report_status_channels.js` → `prune_dead_channels.js` / `update_list_channels.js` → `merge_youtube_from_json_teles.js` are only run by hand today. That's exactly how the list drifted enough to need a 77-channel prune in one pass — a scheduled CI job (weekly cron) running this chain and opening a PR with the diff would catch link rot continuously instead of in occasional big batches.
- [ ] **IndexedDB** → More robust persistence than localStorage.
- [ ] **Register the service worker** → `pwabuilder-sw.js` exists and is referenced by the manifest/`pwa-install`, but nothing calls `.register()` in production. The install prompt (`beforeinstallprompt`) already shows up in real Chrome, so users can "install" the PWA today and get an app with no working offline cache behind it.

### Medium-Low

- [ ] **Test helpers** → Validate transformations and avoid regressions.
    - Priority: the player-slot queue in `channelUI.js` (`acquirePlayerSlot`/`releasePlayerSlot`/`STREAM_LOAD_TIMEOUT_MS`) — a hung stream that never fires `error` used to hold its slot forever and starve every queued channel behind it; a test should cover the timeout path so this can't silently regress.
    - Also worth a smoke check: `createVideoPlayer`'s player renders at a real height (`getBoundingClientRect().height > 0`) after init. A video.js sizing-mode conflict (`fluid` vs `fill`) once left every player decoding and playing with zero visible height — readyState/currentTime alone wouldn't have caught that, only the rendered box size would.

### Low

- [ ] **API and helper documentation** → Only `helperUrlState.js` has JSDoc so far; extend to the other helpers.
- [ ] **Image optimization** → WebP, compression, srcset.
- [ ] **UX in “Load defaults”** → Confirmations and customization.
- [ ] **Lighthouse audit** → Run a full pass now that the a11y basics are in to catch what's left (contrast, perf).

### Optional

- [ ] **Partial migration to TypeScript** → More robustness and progressive typing.
