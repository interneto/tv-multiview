# tv-multiview (teles)

> Fork de [https://github.com/Alplox/teles](https://github.com/Alplox/teles)

Proyecto PWA open-source para visualizar múltiples transmisiones de TV en una cuadrícula o vista única.

## Tabla de Contenidos

- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Inicio Rápido](#inicio-rápido)
- [Gestión de Canales](#gestión-de-canales)
- [Validación de Enlaces M3U8](#validación-de-enlaces-m3u8)
- [Scripts y Herramientas](#scripts-y-herramientas)
- [Buenas Prácticas](#buenas-prácticas)

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

### Validación Básica

Antes de commitear cambios en `json-tv/tv-channels.json`:

```bash
node ./tools/validate_json_light.js
```

## Validación de Enlaces M3U8

El proyecto incluye herramientas para verificar el estado de los enlaces M3U8 en el fichero `json-tv/tv-channels.json`.

### Prerrequisitos para Validación

- Node.js (v12 o superior)
- npm (viene con Node.js)

### Uso Rápido

#### Para Usuarios de Windows

1. Ejecuta `check_m3u8_links.bat` para verificar todos los enlaces M3U8 sin modificar el JSON.
2. O ejecuta `update_m3u8_status.bat` para verificar enlaces y actualizar el JSON con información de estado.

#### Para Todos los Usuarios

```bash
# Verificar enlaces (no modifica el JSON)
node tools/check_m3u8_links.js

# Verificar enlaces y actualizar el JSON con timestamp
node tools/update_m3u8_status.js --update-json
```

### Resultados

La herramienta mostrará:

- Número total de enlaces verificados
- Número de enlaces en línea (funcionando)
- Número de enlaces fuera de línea (no funcionando)

Ejemplo de salida:

```text
Total: 242
Online: 140
Offline: 102
Duplicates: 0
```

## Scripts y Herramientas

### Comandos Útiles

```bash
# Ordenar canales según país
node ./tools/sort_json_by_country.js

# Validación ligera sin dependencias
node ./tools/validate_json_light.js

# Verificar enlaces M3U8
node ./tools/check_m3u8_status.js
```

## Buenas Prácticas

- Validar el JSON antes de subir cambios con los scripts en `tools/`
- Mantener las claves únicas y descriptivas
- Verificar periódicamente el estado de los enlaces M3U8
- Aumentar el tiempo de espera en los scripts si muchos enlaces aparecen como no disponibles
- Revisar los enlaces no disponibles y actualizar el JSON cuando sea necesario
