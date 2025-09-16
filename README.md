# tv-multiview (teles)

> Fork de [https://github.com/Alplox/teles](https://github.com/Alplox/teles)

Proyecto PWA open-source para visualizar múltiples transmisiones de TV en una cuadrícula o vista única.

## Características

- Visualización de múltiples canales simultáneamente en cuadrícula
- Modo de visión única con panel lateral de canales
- Soporte para enlaces M3U8, iframes y transmisiones de YouTube
- Interfaz adaptable (responsive) con temas claro/oscuro
- Instalable como PWA (Progressive Web App)
- Herramientas para validar y gestionar canales

## Estructura del Proyecto

- `index.html` – UI principal y punto de entrada
- `assets/` – Recursos estáticos
    - `js/` – Lógica de la aplicación y helpers
    - `css/` – Hojas de estilo
    - `img/` – Imágenes e iconos
- `json-tv/` – Datos de canales
    - `tv-channels.json` – Fichero principal con canales
    - `tv-channels.m3u` – Lista de reproducción en formato M3U
- `tools/` – Utilidades para manipulación de datos y validación

## Inicio Rápido

### Requisitos

- Node.js (para scripts de `tools/`)
- Un servidor estático para servir la PWA

### Instalación y Ejecución

1. Clonar el repositorio
2. Servir localmente (desde la raíz del repo):

```bash
npx http-server -c-1 . -p 8080
# Abrir http://localhost:8080
```

### Comandos Útiles

```bash
# Ordenar canales iptv según país
node ./tools/sort_json_by_country.js

# Validación ligera sin dependencias
node ./tools/validate_json_light.js

# Generar reporte de estado y actualizar lista de canales json
node ./tools/report_status_channels.js
node ./tools/update_list_channels.js
```

## Gestión de Canales

Los canales se encuentran en `json-tv/tv-channels.json`. Cada clave es un ID único y el objeto debe seguir la estructura:

```json
"id": {
  "name": "Nombre del Canal",
  "logo": "url_logo",
  "signals": { 
    "m3u8_url": ["..."], 
    "iframe_url": [], 
    "yt_id": "",
    "yt_embed": "",
    "yt_playlist": "",
    "twitch_id": ""
  },
  "website": "",
  "category": "news",
  "country": "cl"
}
```

## Buenas Prácticas

- Validar el JSON antes de subir cambios con los scripts en `tools/`
- Mantener las claves únicas y descriptivas
- Verificar periódicamente el estado de los enlaces M3U8
- Aumentar el tiempo de espera en los scripts si muchos enlaces aparecen como no disponibles
- Revisar los enlaces no disponibles y actualizar el JSON cuando sea necesario
