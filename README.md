# tv-multiview (teles)

Proyecto PWA open-source para visualizar múltiples transmisiones de TV en una cuadrícula o vista única.

## Estructura relevante

- `index.html` – UI principal.
- `assets/js/` – lógica de la app y helpers.
- `json-teles/tv-channels.json` – fichero principal con canales.
- `tools/` – utilidades para manipular y validar JSON (ordenar, chequear añadidos).

## Rápido inicio (requisitos)

- Node.js (para scripts de `tools/`).
- Un servidor estático para servir la PWA (p. ej. `npx http-server` o `npm run start`).

## Comandos útiles

- Servir localmente (desde la raíz del repo):

```powershell
npx http-server -c-1 . -p 8080
# Abrir http://localhost:8080
```

- Ejecutar scripts de `tools` (ejemplos):

```powershell
node .\tools\sort_json_by_country.js
node .\tools\check_channels.js
node .\tools\validate_additions.js
```

## Agregar o editar canales

Los canales se encuentran en `json-teles/tv-channels.json`. Cada clave es un id único y el objeto debe seguir la estructura:

```json
"id": {
  "name": "Nombre del Canal",
  "logo": "url_logo",
  "signals": { "m3u8_url": ["..."] , "iframe_url": [], "yt_id":"" },
  "website": "",
  "category": "news",
  "country": "cl"
}
```

## Buenas prácticas

- Validar nuevo JSON antes de subir cambios con los scripts en `tools/`.
- Mantener las claves únicas y descriptivas.

## Contribuir

- Fork, crear branch, abrir PR con descripción clara de cambios.
- Añade tests si modificas helpers o lógica de parsing.

## Licencia

- Revisa `LICENSE` en la raíz.

## Deploy to GitHub Pages

You can publish this static project to GitHub Pages from the `main` branch. Two common options:

- Enable Pages in the repository settings and serve from the `main` branch root.
- Or use the included GitHub Actions workflow `.github/workflows/gh-pages.yml` which deploys the repository root on every push to `main`.

To use the workflow: ensure `npm ci` runs successfully in CI (the project has no build step). Push to `main` and the action will publish the repository files to the `gh-pages` branch automatically.

If you prefer to publish locally, you can build a ZIP of the root folder and upload it via the Pages UI.
