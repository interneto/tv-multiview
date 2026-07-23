# Spanish→English Full Codebase Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename every Spanish identifier, DOM id, CSS selector, data-attribute, and localStorage key in tv-multiview to English, without breaking the running app (no test suite exists — verification is ESLint + zero-leftover grep + manual browser smoke test per stage).

**Architecture:** Apply renames in 4 independent, sequentially-safe stages (exported functions → DOM ids/CSS/data-attrs → localStorage keys with migration → internal-only variables), each stage scripted as an exact-string global replace (longest-token-first) rather than hundreds of manual edits, each stage git-committed and verified before the next starts.

**Tech Stack:** Vanilla JS (ES modules, no bundler), Bootstrap 5, static HTML/CSS. No test framework — verification relies on `npx eslint .`, `grep -r` for leftover old tokens, and manually exercising the app in a browser (add/remove channel, country filter, single view, theme, floating buttons, URL share, experimental mode) after each stage.

## Global Constraints

- **Do NOT touch `assets/js/i18n.js`** — its `es`/`en` tables are intentional user-facing localization, not code debt.
- **Do NOT touch `assets/js/constants/countryNames.js`** — real-world country names legitimately contain accented native spellings (e.g. `'España'`, `'Česká republika'`).
- **`assets/js/constants/categoryIcons.js`** has Spanish `title="..."` tooltip text (`"Icono clásico"` etc) — this is a UI-string translation, not an identifier rename; handle in Stage 2 alongside other UI-facing strings if in scope, otherwise leave for a separate pass.
- **`json-tv/canales.json`** (legacy, untracked/gitignored, unused by app code) and **`assets/js/helpers/helperSingleView.js`** (dead 1-line stub: `export * from './helperUnicVision.js';`) should be deleted as part of Stage 1 cleanup — confirmed dead via `settings`/import grep, zero references besides the stub itself.
- Every stage: run `npx eslint .` (config already exists at `eslint.config.js`) and `grep -rn "<old-token>" assets/ index.html` (expect zero hits) before moving to the next stage.
- Commit each stage separately (`git add -A && git commit`) on the existing `improve-codebase` branch so a broken stage is a one-command revert, not a lost afternoon.
- This repo has **no test suite** — the browser smoke-test checklist at the bottom of this doc is the only regression net. Do not skip it.

---

## Master Rename Maps (already researched — use these verbatim, do not re-derive)

### Map A — Exported function/const names (`assets/js/helpers/*.js`)

Scope is narrower than it looks: `channelUI.js` and `channelsData.js` exports are **already English** (`generateStreamIframe`, `createVideoPlayer`, `createChannelOverlay`, `createChannelFragment`, `updateActiveSignal`, `isBackupValid`, `saveChannelBackup`, `fetchBackupChannels`) — only `helpers/*.js` and a few `main.js`-internal (non-exported) functions need renaming.

| File | Old export | New export |
|---|---|---|
| helperAdjustActiveChannelClasses.js | `ajustarClaseColTransmisionesPorFila` | `adjustColumnCountPerRow` |
| helperBSTooltips.js | `activarTooltipsBootstrap` | `enableBootstrapTooltips` |
| helperBSTooltips.js | `removerTooltipsBootstrap` | `disposeBootstrapTooltips` |
| helperBSToast.js | `mostrarToast` | `showToast` |
| helperButtonClass.js | `ajustarClaseBotonCanal` | `setChannelButtonClass` |
| helperGenerateChannelButtons.js | `crearBotonesParaCanales` | `createChannelButtons` |
| helperConnectionState.js | `iniciarRevisarConexion` | `startConnectionCheck` |
| helperConnectionState.js | `revisarConexion` (internal, not exported) | `checkConnection` |
| helperDefaultChannels.js | `obtenerCanalesPredeterminados` | `getDefaultChannels` |
| helperCreateCountryButtons.js | `crearBotonesPaises` | `createCountryButtons` |
| helperEmptySignal.js | `borraPreferenciaSeñalInvalida` | `clearInvalidSignalPreference` |
| helperFilterChannels.js | `filtrarCanalesPorInput` | `filterChannels` |
| helperCheckEmptySignals.js | `revisarSeñalesVacias` | `checkEmptySignals` |
| helperReplaceActiveChannel.js | `reemplazarCanalActivo` | `replaceActiveChannel` |
| helperHideOverlayButtonText.js | `hideTextoBotonesOverlay` | `hideOverlayButtonText` |
| helperInsertDivError.js | `insertarDivError` | `insertErrorDiv` |
| helperChangeButtonsOrder.js | `guardarOrdenOriginal` | `saveOriginalOrder` |
| helperChangeButtonsOrder.js | `ordenarBotonesCanalesAscendente` | `sortChannelButtonsAscending` |
| helperChangeButtonsOrder.js | `ordenarBotonesCanalesDescendente` | `sortChannelButtonsDescending` |
| helperChangeButtonsOrder.js | `restaurarOrdenOriginalBotonesCanales` | `restoreOriginalChannelButtonsOrder` |
| helperRowNumber.js | `obtenerNumeroCanalesFila` | `getChannelsPerRow` |
| helperPlayAudio.js | `playAudioSinDelay` | `playAudioWithoutDelay` |
| helperUpdateOverlayButtons.js | `actualizarBotonesPersonalizarOverlay` | `updateOverlayCustomizationButtons` |
| helperUnicVision.js | `activarVisionUnica` | `enableSingleView` |
| helperUnicVision.js | `desactivarVisionUnica` | `disableSingleView` |
| helperUpdateFloatingButtons.js | `alternarPosicionBotonesFlotantes` | `toggleFloatingButtonsPosition` |
| helperUpdateFloatingButtons.js | `clicBotonPosicionBotonesFlotantes` | `onFloatingButtonPositionClick` |
| helperUpdateFloatingButtons.js | `actualizarBotonesFlotantes` | `updateFloatingButtons` |
| helperUpdateSliderValue.js | `actualizarValorSlider` | `updateSliderValue` |
| helperTheme.js | `aplicarTema` | `applyTheme` |
| helperTheme.js | `detectarTemaSistema` | `detectSystemTheme` |
| helperSingleViewGridOrder.js | `cargarOrdenVisionUnica` | `loadSingleViewOrder` |
| helperSingleViewGridOrder.js | `guardarOrdenPanelesVisionUnica` | `saveSingleViewPanelsOrder` |
| helperSingleViewGridOrder.js | `toggleClaseOrdenado` | `toggleOrderedClass` |
| helperSingleViewGridOrder.js | `CONTAINER_INTERNO_VISION_UNICA` (queries `.vision-unica-grid`, see Map B) | `SINGLE_VIEW_INNER_CONTAINER` |

After renaming, `assets/js/helpers/index.js` re-exports need no changes (it's `export * from './fileName.js'`, filenames already English) — but every `import { oldName } from './helpers/index.js'` (or direct file import) across `main.js`, `buttons.js`, `channelUI.js`, `observer.js` must be updated to the new name. Grep `grep -rn "oldName" assets/js/` per row to find every call site.

### Map B — DOM `id`, CSS class, and `data-*` attribute values

These appear in **three places that must change together**: `index.html` (`id="..."`, `class="..."`, `data-*="..."`), `assets/css/style.css` (`#id`, `.class` selectors), and every `assets/js/*.js` file that does `document.querySelector('#...')`, `getElementById`, `dataset.x`, `setAttribute`, `classList.add/toggle/replace`, or template-literal id construction (e.g. `` `${PREFIJO}-body-botones-canales` ``).

**Method:** sort this table by string length descending, then do one exact-string `replaceAll` pass per row across `index.html`, `assets/css/style.css`, and every `assets/js/**/*.js` file. Longest-first prevents a short token (`modal-canales`) from corrupting inside a longer one (`modal-canales-titulo`) before the longer rule runs.

Full id list (from `grep -oE 'id="[a-zA-Z0-9_-]*"' index.html`, 106 total, ~85 Spanish):

| Old | New |
|---|---|
| alerta-borrado-localstorage | alert-localstorage-cleared |
| alerta-error-carga-canales | alert-channels-load-error |
| alerta-guardado-canales | alert-channels-saved |
| alerta-internet-status | alert-internet-status |
| boton-borrar-localstorage | button-clear-localstorage |
| boton-borrar-localstorage-no-carga-canales | button-clear-localstorage-no-channels-loaded |
| boton-compartir-vista | button-share-view |
| boton-entendido | button-understood |
| boton-experimental | button-experimental |
| boton-modal-cargar-canales-por-defecto | button-modal-load-default-channels |
| boton-modal-quitar-todo-canal-activo | button-modal-remove-all-active-channels |
| boton-mover-panel-canales-vision-unica | button-move-single-view-channels-panel |
| boton-offcanvas-cargar-canales-por-defecto | button-offcanvas-load-default-channels |
| boton-offcanvas-quitar-todo-canal-activo | button-offcanvas-remove-all-active-channels |
| boton-personalizar-boton-mover-overlay | button-customize-move-overlay-button |
| btnCambiar | btnChange |
| btnFuente | btnSource |
| btnMover | btnMove |
| btnQuitar | btnRemove |
| btnradioflotante1..9 | btnFloatingRadio1..9 |
| checkbox-personalizar-altura-canales | checkbox-customize-channels-height |
| checkbox-personalizar-tema | checkbox-customize-theme |
| checkbox-personalizar-texto-botones-flotantes | checkbox-customize-floating-buttons-text |
| checkbox-personalizar-visualizacion-navbar | checkbox-customize-navbar-display |
| checkbox-personalizar-visualizacion-overlay | checkbox-customize-overlay-display |
| checkbox-tarjeta-logo-background | checkbox-card-logo-background |
| container-botones-personalizar-transmisiones-por-fila | container-customize-streams-per-row-buttons |
| container-tarjeta-logo-background | container-card-logo-background |
| container-video-vision-unica | container-single-view-video |
| container-vision-cuadricula | container-grid-view |
| container-vision-unica | container-single-view |
| grupo-botones-flotantes | group-floating-buttons |
| grupo-botones-personalizar-botones-dentro-overlay | group-customize-overlay-buttons |
| grupo-botones-posicion-botones-flotantes | group-floating-buttons-position |
| icono-personalizar-altura-canales | icon-customize-channels-height |
| icono-personalizar-tema | icon-customize-theme |
| icono-personalizar-texto-botones-flotantes | icon-customize-floating-buttons-text |
| icono-personalizar-visualizacion-overlay | icon-customize-overlay-display |
| icono-personalizar-visualizacion-tarjeta-logo-background | icon-customize-card-logo-background-display |
| icono-sin-señal-vision-unica | icon-single-view-no-signal |
| label-para-name-canal-cambiar | label-for-change-channel-name |
| modal-bienvenida | modal-welcome |
| modal-cambiar-canal (+ all `modal-cambiar-canal-*` sub-ids) | modal-change-channel (+ `modal-change-channel-*`, same suffix pattern: body-botones-canales→body-channel-buttons, boton-orden-ascendente→button-order-ascending, boton-orden-descendente→button-order-descending, boton-orden-original→button-order-original, collapse-botones-listado-filtro-countries→collapse-country-filter-buttons, collapse-btn-group unchanged, input-filtro→input-filter, mensaje-alerta→alert-message) |
| modal-canales (+ all `modal-canales-*` sub-ids, same suffix pattern as above, plus titulo→title) | modal-channels (+ `modal-channels-*`) |
| offcanvas-canales (+ all `offcanvas-canales-*` sub-ids, same suffix pattern) | offcanvas-channels (+ `offcanvas-channels-*`) |
| panel-canales-vision-unica | panel-single-view-channels |
| sidepanel-titulo | sidepanel-title |
| span-contenedor-error | span-error-container |
| span-valor-altura-canales | span-channels-height-value |
| span-valor-tema | span-theme-value |
| span-valor-texto-en-botones-flotante | span-floating-buttons-text-value |
| span-valor-transmisiones-por-fila | span-streams-per-row-value |
| span-valor-visualizacion-navbar | span-navbar-display-value |
| span-valor-visualizacion-overlay | span-overlay-display-value |
| span-valor-visualizacion-tarjeta-logo-background | span-card-logo-background-display-value |
| status-altura-canales | status-channels-height |
| status-texto-botones-flotantes | status-floating-buttons-text |
| vision-unica-body-botones-canales (+ all `vision-unica-*` sub-ids, same suffix pattern) | single-view-body-channel-buttons (+ `single-view-*`) |
| overlay-de-canal-${canalId} (template literal in channelUI.js) | channel-overlay-${canalId} |
| overlay-boton-selecionar-señal (typo for seleccionar) | overlay-button-select-signal |
| overlay-boton-mover | overlay-button-move |
| overlay-boton-cambiar | overlay-button-change |
| overlay-boton-pagina-oficial | overlay-button-official-page |
| overlay-boton-quitar | overlay-button-remove |

Unchanged (already English/generic, do not touch): `modal-collapse-btn-group`, `offcanvas-collapse-btn-group` (note: this id is duplicated in index.html at two different elements — pre-existing bug, out of scope for this rename, flag separately), `modal-reset`, `navbar`, `navbar-toggler`, `pwa-install`, `sidepanel`, `toast-container`.

**CSS classes** (`assets/css/style.css`):

| Old | New |
|---|---|
| `.d-none__barras-overlay__overlay-boton-cambiar` | `.d-none__overlay-bars__overlay-button-change` |
| `.d-none__barras-overlay__overlay-boton-mover` | `.d-none__overlay-bars__overlay-button-move` |
| `.d-none__barras-overlay__overlay-boton-pagina-oficial` | `.d-none__overlay-bars__overlay-button-official-page` |
| `.d-none__barras-overlay__overlay-boton-quitar` | `.d-none__overlay-bars__overlay-button-remove` |
| `.d-none__barras-overlay__overlay-boton-selecionar-se[ñal]` | `.d-none__overlay-bars__overlay-button-select-signal` |
| `.modal-body-canales` | `.modal-body-channels` |
| `.offcanvas-canales-body-canales` | `.offcanvas-channels-body-channels` |
| `.tarjeta-logo-background` | `.card-logo-background` |
| `.vision-unica-body-canales` | `.single-view-body-channels` |
| `.vision-unica-grid` | `.single-view-grid` |
| `.vision-unica-grid-reordenado` | `.single-view-grid-reordered` |
| `.clase-para-mover` (Sortable handle class, main.js) | `.drag-handle` |
| `.marca-al-mover` (Sortable ghostClass, main.js) | `.drag-ghost` |
| `.d-none__barras-overlay` (body class toggle, main.js) | `.d-none__overlay-bars` |
| `.div-boton-personalizar-overlay` | `.customize-overlay-button-div` |
| `.svg-bandera` | `.flag-svg` |

**`data-*` attributes:**

| Old | New | Note |
|---|---|---|
| `data-canal` | `data-channel` | read via `dataset.canal` in several files — update reads too |
| `data-canal-cambio` | `data-channel-change` | |
| `data-button-cambio` | `data-button-change` | |
| `data-botonOverlay` | `data-overlay-button` | dead attribute, never read by JS — safe zero-risk rename, or delete entirely since unused |
| `data-country` | unchanged | already English |
| `data-position`, `data-language-option`, `data-ui-*`, `data-bs-*` | unchanged | already English/Bootstrap |
| `data-respaldo` (check exact file — seen in earlier grep, confirm usage before renaming) | `data-backup` | verify still in use, not dead like `data-botonOverlay` |

### Map C — localStorage keys (needs migration, per user decision)

User explicitly wants **rename with migration fallback** — do not silently drop existing users' saved preferences. Pattern for each key:

```js
function readWithMigration(newKey, oldKey) {
  const value = localStorage.getItem(newKey);
  if (value !== null) return value;
  const legacy = localStorage.getItem(oldKey);
  if (legacy !== null) {
    localStorage.setItem(newKey, legacy);
    localStorage.removeItem(oldKey);
  }
  return legacy;
}
```

Apply this at every `localStorage.getItem(oldKey)` call site (one-time migration on first read after upgrade), then switch all `setItem`/`getItem`/`removeItem` calls to `newKey` going forward.

| Old key | New key |
|---|---|
| `canales-vision-cuadricula` | `active-channels-grid-view` |
| `diseño-seleccionado` | `selected-layout` |
| `modo-experimental` | `experimental-mode` |
| `numero-class-columnas-por-fila` | `columns-per-row-class` |
| `orden-grid-vision-unica` | `single-view-grid-order` |
| `posicion-botones-flotante` | `floating-buttons-position` |
| `preferencia-señal-canales` | `channel-signal-preference` |
| `tarjeta-fondo-display` | `card-background-display` |
| `texto-botones-flotantes` | `floating-buttons-text` |
| `uso-100vh` | `use-100vh` |
| `valor-input-range` | `input-range-value` |

Unchanged (already English): `modal-status`, `navbar-display`, `overlay-display`, `theme`.

**Also check stored VALUES, not just keys** — e.g. `uso-100vh` stores the string `'activo'`/`'inactivo'`, and `diseño-seleccionado` stores `'vision-unica'` as a value. If Map B renames `vision-unica` → `single-view` as an identifier concept, decide whether stored values need the same migration treatment (recommend: yes, translate values too, same migration-fallback pattern, do in the same pass as the key rename since you're already touching every read/write site).

### Map D — Internal-only variables (per-file, no cross-file coordination needed)

Not fully enumerated — do this live while rewriting each file for Maps A/B/C (you're already opening the file, translating local variable names is near-zero marginal cost). Reuse this vocabulary consistently:

`canal→channel, boton/botones→button/buttons, vision→view, unica→single, cuadricula→grid, cambiar/cambio→change, activo/activa→active, señal/señales→signal/signals, pais/paises→country/countries, personalizar→customize, alerta→alert, mensaje→message, titulo→title, valor→value, tema→theme, altura→height, texto→text, flotante/flotantes→floating, transmision/transmisiones→stream/streams, posicion→position, orden→order, ascendente/descendente→ascending/descending, filtro→filter, listado→list, compartir→share, mover→move, icono→icon, grupo→group, contenedor→container, bienvenida→welcome, desconocido→unknown, conexion→connection, borrar/borrado→clear/cleared, guardar/guardado→save/saved, carga/cargar→load, quitar→remove, todo→all, visualizacion→display, tarjeta→card, respaldo→backup, fila→row, columna/columnas→column/columns, clase/clases→class/classes, existente→existing, vacías/vacias→empty, predeterminados→default, reemplazar→replace, en vivo→live`.

Also translate Spanish inline comments and `console.error`/error-message strings while in each file (separate from the `t()` i18n system — these are dev-facing, not user-facing, so plain English strings are fine, no i18n key needed).

---

## Tasks

### Task 1: Stage 1 — Exported function renames (Map A)

**Files:** all of `assets/js/helpers/*.js` per Map A table, plus every importer (`main.js`, `buttons.js`, `channelUI.js`, `observer.js`, `helpers/index.js` needs no change since it's `export *`).

- [ ] For each row in Map A: rename the `export function`/`export const` declaration and every internal recursive reference within that file.
- [ ] `grep -rn "<oldName>" assets/js/` for each renamed symbol — update every import/call site found (expect hits in `main.js`, `buttons.js`, `channelUI.js`, and sibling helper files that cross-import via `./index.js`).
- [ ] Delete dead code: `assets/js/helpers/helperSingleView.js` (1-line stub), then remove its `export * from './helperSingleView.js';` line from `helpers/index.js`, and fix the one caller that likely imports from it to import from `helperUnicVision.js` directly instead — check first with `grep -rn "helperSingleView" assets/js/`.
- [ ] Delete unused `json-tv/canales.json` (confirm zero references first: `grep -rn "canales.json" assets/ index.html`).
- [ ] `npx eslint .` — zero errors.
- [ ] `grep -rn` for every Map A old name across `assets/` — zero hits.
- [ ] Commit: `git add -A && git commit -m "refactor: rename Spanish exported helper functions to English"`.

### Task 2: Stage 2 — DOM ids, CSS classes, data-attributes (Map B)

**Files:** `index.html`, `assets/css/style.css`, every `assets/js/**/*.js` file that references any Map B token (expect nearly all of them — `main.js`, `buttons.js`, `channelUI.js`, `observer.js`, most helpers, `i18n.js` DOES reference a couple of ids like `#overlay-boton-selecionar-señal` for query purposes even though its translation TABLE is out of scope, its DOM queries are in scope).

- [ ] Sort Map B (ids + classes + data-attrs) by string length descending into one ordered list.
- [ ] Apply one exact-string `replaceAll` per token, longest first, across `index.html` + `assets/css/style.css` + all `assets/js/**/*.js` — write this as a small Node script (`node scripts/rename-tokens.mjs`) reading the map as a JS array of `[old, new]` pairs rather than doing it by hand across ~40 files; delete the script after use or keep it in `tools/` if useful for future passes.
- [ ] Special case: template-literal id construction like `` `${PREFIJO}-body-botones-canales` `` in `main.js`/helpers — `PREFIJO` values come from `CHANNEL_CONTAINER_ID_PREFIXES` in `constants/configGlobal.js`; check that array's contents and rename its entries too if they're Spanish prefixes (e.g. `modal-canales` as a prefix value, not just a literal id).
- [ ] Special case: `overlay-de-canal-${canalId}` and similar dynamic id templates in `channelUI.js` — the static Spanish portion (`overlay-de-canal-`) needs renaming even though `canalId` is a variable.
- [ ] `npx eslint .` — zero errors.
- [ ] `grep -rn` for every Map B old token across `index.html assets/` — zero hits (excluding the two `modal-collapse-btn-group`/`offcanvas-collapse-btn-group` intentionally-unchanged ids, and the pre-existing duplicate-id bug — note it in a follow-up, don't fix it silently as part of this rename PR).
- [ ] Commit: `git add -A && git commit -m "refactor: rename Spanish DOM ids, CSS classes, and data-attributes to English"`.

### Task 3: Stage 3 — localStorage keys with migration (Map C)

**Files:** every file with `localStorage.getItem/setItem/removeItem` — `main.js` is the majority, check `buttons.js`, helpers too via `grep -rn "localStorage\." assets/js/`.

- [ ] Add a small shared migration helper (new file `assets/js/helpers/helperLocalStorageMigration.js`, exported, imported wherever needed) implementing the `readWithMigration(newKey, oldKey)` pattern from Map C.
- [ ] Replace every `localStorage.getItem(oldKey)` with `readWithMigration(newKey, oldKey)`, every `setItem`/`removeItem(oldKey)` with the new key.
- [ ] Decide + implement value-string migration for `uso-100vh` (`'activo'/'inactivo'`) and `diseño-seleccionado` (`'vision-unica'`) if those value strings are being translated too (recommended, see Map C note).
- [ ] Manual verification: in a browser with an existing `localStorage` state (set the OLD keys manually via devtools console to simulate an existing user), reload the app, confirm preferences carry over once, then confirm the OLD keys are gone and only new English keys remain on second reload.
- [ ] `npx eslint .` — zero errors.
- [ ] Commit: `git add -A && git commit -m "refactor: rename localStorage keys to English with migration fallback"`.

### Task 4: Stage 4 — Internal-only variables, params, comments, error strings (Map D)

**Files:** every file touched in Tasks 1–3, plus any remaining files with leftover Spanish per `grep -rE "[a-zA-Z_$][a-zA-Z0-9_$]*[áéíóúñÁÉÍÓÚÑ][a-zA-Z0-9_$]*" assets/js -r --include=*.js` and a broader non-accented Spanish-word scan (the accent-only grep undercounts — cross-check against Map D's vocabulary list for non-accented words like `canal`, `boton`, `vision` too).

- [ ] Go file by file (natural to batch: helpers/ first since already open from Task 1, then main.js/buttons.js/channelUI.js/channelsData.js/observer.js), translate local variable/parameter names using the Map D vocabulary, translate inline comments and `console.error`/thrown-error strings to English.
- [ ] Skip: `i18n.js` (out of scope, see Global Constraints), `constants/countryNames.js` (real data), `categoryIcons.js` `title="..."` strings (separate UI-string task, not identifier rename — note as follow-up if not doing it now).
- [ ] `npx eslint .` — zero errors after each file.
- [ ] Final sweep: `grep -rE "[áéíóúñÁÉÍÓÚÑ]" assets/js assets/css index.html` should return **zero** hits outside `i18n.js` and `constants/countryNames.js`.
- [ ] Commit per logical group (e.g. one commit for all helpers, one for main.js, etc — don't do all of Stage 4 as one giant commit).

### Task 5: Full regression smoke test (manual, no test suite exists)

Run `npx vite` or serve `index.html` via `npx http-server` (per README), open in a browser, and manually verify:

- [ ] Load app fresh (no localStorage) — default channels load correctly.
- [ ] Add a channel via the channel picker modal — video/iframe renders, button switches active-state style.
- [ ] Remove a channel — removed cleanly, no console errors, Video.js instance disposed (check console for the "Disposing player" log, no leaked-instance warnings).
- [ ] Country filter — filtering by country shows/hides the right channel buttons.
- [ ] Sort buttons (ascending/descending/original) — reorders correctly in at least one of modal/offcanvas/single-view panels.
- [ ] Switch to single view (vision única) — layout switches, Sortable drag-reorder still works, "no signal" icon shows/hides correctly.
- [ ] Switch back to grid view.
- [ ] Theme toggle (light/dark) — applies and persists across reload.
- [ ] Floating buttons — reposition buttons work, text-visibility toggle works.
- [ ] Overlay customization checkbox — per-button overlay visibility toggles persist.
- [ ] URL share (`pushStateToUrl`/`parseStateFromUrl`) — copy the URL, open in a new tab, same channels + layout restore.
- [ ] Experimental mode button — loads IPTV channel list without errors.
- [ ] Bootstrap tooltips still show on hover after any DOM churn (add/remove channel, reorder).
- [ ] Browser console: zero uncaught errors through the whole checklist.
- [ ] Confirm `git log` shows the 4 stage commits (or per-file Stage 4 commits) cleanly on `improve-codebase`, ready for the user to review/squash/PR at their discretion.
