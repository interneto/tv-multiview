# tv-multiview (teles)

> Fork of [https://github.com/Alplox/teles](https://github.com/Alplox/teles)

Open-source PWA project for displaying multiple TV streams in a grid or single view.

## Features

- Display multiple channels simultaneously in a grid
- Single-view mode with channel sidebar
- Support for M3U8 links, iframes, and YouTube streams
- Responsive interface with light/dark themes
- Installable as a PWA (Progressive Web App)
- Tools for validating and managing channels

## Project Structure

- `index.html` – Main UI and entry point
- `assets/` – Static resources
- `js/` – Application logic and helpers
- `css/` – Stylesheets
- `img/` – Images and icons
- `json-tv/` – Channel data
- `tv-channels.json` – Main channel file
- `tv-channels.m3u` – M3U playlist
- `tools/` – Utilities for data manipulation and validation

## Quick Start

### Requirements

- Node.js (for `tools/` scripts)
- A static server to serve the PWA

### Installation and Running

1. Clone the repository
2. Serve locally (from the repo root):

```bash
npx http-server -c-1 . -p 8080
# Open http://localhost:8080
```

### Useful Commands

```bash
# Sort IPTV channels by country
node ./tools/sort_json_by_country.js

# Lightweight validation without dependencies
node ./tools/validate_json_light.js

# Generate a status report and update the JSON channel list
node ./tools/report_status_channels.js
node ./tools/update_list_channels.js
```

## Channel Management

The channels are located in `json-tv/tv-channels.json`. Each key is a unique ID, and the object must follow the structure:

```json
"id": {
  "name": "Channel Name",
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

## Best Practices

- Validate the JSON before uploading changes with scripts in `tools/`
- Keep keys unique and descriptive
- Periodically check the status of M3U8 links
- Increase the timeout in scripts if many links appear as unavailable
- Review unavailable links and update the JSON when necessary
