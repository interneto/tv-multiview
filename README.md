# tv-multiview (teles)

> Fork de https://github.com/Alplox/teles

Proyecto PWA open-source para visualizar múltiples transmisiones de TV en una cuadrícula o vista única.

## Estructura relevante

- `index.html` – UI principal.
- `assets/js/` – lógica de la app y helpers.
- `json-tv/tv-channels.json` – fichero principal con canales.
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
node .\tools\sort_json_by_pais.js      # Ordena canales según lista de países
node .\tools\check_channels.js         # Chequeo rápido de integridad
node .\tools\validate_additions.js     # (Si existe) valida propuestas de nuevos canales
node .\tools\validate_json_light.js    # Validación ligera sin dependencias
```

## Validación del JSON de canales

Antes de commitear cambios en `json-tv/tv-channels.json`:

```powershell
node .\tools\validate_json_light.js
```

## Agregar o editar canales

Los canales se encuentran en `json-tv/tv-channels.json`. Cada clave es un id único y el objeto debe seguir la estructura:

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
