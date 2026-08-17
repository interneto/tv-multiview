# To Do

## Status Overview

✅ **12 tasks completed** — See [changelog.md](changelog.md) for full details under `[Unreleased]`.

## 📋 Pending

- [x] **Partial migration to TypeScript** → `checkJs` enabled and 14% of helper errors fixed. Infrastructure ready (types.d.ts, improved JSDoc). Remaining 95 errors can be tackled incrementally. Type-checking now active for all `assets/js/helpers/` files.

## Known limits

- **The health check cannot see CORS.** `report_status_channels.js` asks "does the server answer?" from Node, which never applies the same-origin policy. A server can answer 200 and still be useless in the browser if it does not send an `Access-Control-Allow-Origin` the site can use — that is why `skynews` and `bbearth` shipped as defaults while never playing a frame. `tools/check_cors_channels.js` covers that gap (it sends the published site's `Origin`), and `prune_dead_channels.js` treats a CORS-blocked stream as dead.
- **Pluto TV streams echo only allow-listed origins.** They work from `localhost` and return `http://pluto.tv` for anything else, so they are blocked on the published site. Verifying a stream from a local dev server is not proof it works in production.
