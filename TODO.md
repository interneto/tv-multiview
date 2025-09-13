# To Do

- Mejorar el listado de [tv-channels](./json-teles/tv-channels.json)
- Filtrar canales por sección
- Comprobar si los canales están activos
- Pasar a inglés


----

## Mejoras

Mejoras recomendadas (priorizadas)

1) Documentación inicial (Alta prioridad)

Qué: Crear README.md con propósito del proyecto, estructura de carpetas, instrucciones para desarrollo (servir los archivos, ejecutar scripts en tools), cómo añadir canales en json-teles, y cómo ejecutar checks (node tools/validate_json.js o similares).
Dónde: crear README.md en la raíz.
Por qué: facilita contribuciones, reduce fricción para reproducir y probar cambios.
Cómo probar: abrir README.md, seguir pasos para ejecutar scripts locales (p. ej. node tools/validate_additions.js).
2) package.json + scripts (Alta)

Qué: Añadir package.json con scripts útiles: start (servidor estático tipo serve o http-server), lint, format, test, check-json. Incluir devDeps mínimas (eslint, prettier, serve o http-server, jest opcional).
Dónde: raíz (package.json).
Por qué: unifica comandos y permite usar CI fácilmente.
Cómo probar: npm install y npm run start para servir la app.
3) Validación de JSON + Schema (Alta)

Qué: Crear schema/tv-channels.schema.json que describa la forma esperada (id: object con nombre, logo, señales con subcampos, país, categoría), y tools/validate_json.js que valide tv-channels.json.
Dónde: schema/ y tools.
Por qué: evita introducir entradas malformadas que rompan la app.
Cómo probar: node tools/validate_json.js — debe pasar con el JSON actual.
4) Integración CI (Medium-High)

Qué: GitHub Actions workflow .github/workflows/ci.yml que ejecute npm ci, lint, run json validation, run tests.
Dónde: .github/workflows/ci.yml.
Por qué: evita regressions en PRs y estandariza calidad.
Cómo probar: hacer PR o ejecutar localmente act (opcional).
5) Lint y formateo (Medium)

Qué: Añadir eslint + prettier, configuración básica; aplicar autofix a assets/js/* y tools/*.
Dónde: .eslintrc, .prettierrc.
Por qué: uniformidad y facilitar mantenimiento.
Cómo probar: npm run lint y npm run format.
6) Mejor manejo de estado y URL (Medium)

Qué: Serializar estado de la vista en la URL (query string o hash) — canales cargados, layout (cuadrícula/única), número de columnas, país filtrado. Añadir un helper para construir/parsear URL y aplicar estado al cargar.
Dónde: main.js, helpers/ (nuevo helperURLState.js).
Por qué: permite compartir vistas y restaurar sesiones.
Cómo probar: aplicar un estado en la UI y comprobar que la URL cambia; recargar la página y verificar que el estado se restaura.
7) Persistencia robusta (IndexedDB) (Medium)

Qué: Mover backups grande/estructurados desde localStorage a IndexedDB (ej: idb-keyval o API nativa). Mantener fallback en localStorage.
Dónde: canalesData.js y helpers de backup.
Por qué: listas grandes pueden sobrepasar límites de localStorage. Mejora rendimiento.
Cómo probar: guardar un JSON grande y restaurar.
8) PWA / Service Worker: mejoras de caching (Medium)

Qué: Revisar pwabuilder-sw.js para agregar políticas: cache dinámico para JSON, estrategias para m3u8/medios (careful: streaming puede requerir bypass), versionado de caché y limpieza.
Dónde: pwabuilder-sw.js, site.webmanifest.
Por qué: mejorar offline y rendimiento PWA.
Cómo probar: instalar PWA, forzar offline, recargar.
9) Accesibilidad (a11y) (Medium)

Qué: Auditar con Lighthouse, añadir roles ARIA, mejoras de foco en controles, labels en inputs, contrastes.
Dónde: index.html, componentes de UI y botones en js.
Por qué: mejor experiencia y cumplimiento de estándares.
Cómo probar: Lighthouse a11y y uso con teclado / lector de pantalla.
10) Tests para helpers (Medium-Low)

Qué: Añadir tests (Jest/Vitest) para funciones en helpers (p. ej. helperM3U.js, sonNombresSimilares, helperGuardarCanales).
Dónde: __tests__/ o tests/.
Por qué: asegurar transformaciones de datos y evitar regresiones.
Cómo probar: npm test.
11) Mejor manejo de errores y reintentos (Low-Medium)

Qué: Agregar retries y backoff para fetch de JSON y m3u; informar al usuario con mensajes claros en UI.
Dónde: canalesData.js, helpers/helperEstadoConexion.js.
Por qué: redes inestables y fuentes externas son comunes.
Cómo probar: simular fallas de fetch y ver reintentos y mensajes.
12) Documentar API pública y helpers (Low)

Qué: Añadir JSDoc en funciones públicas (tele.add, tele.remove, obtenerCanalesPredeterminados) y un fichero docs/ corto.
Dónde: en los archivos fuente.
Por qué: facilita contribución y uso interno.
Cómo probar: revisar JSDoc y autocompletado en IDE.
13) Optimizar imágenes y assets (Low)

Qué: Comprimir y servir WebP cuando sea posible; agregar srcset para previews.
Dónde: img y index.html.
Por qué: reduce peso y mejora score de Lighthouse.
Cómo probar: ejecutar Lighthouse y medir mejoras.
14) UX: confirmación y personalización para “Cargar predeterminados” (Low)

Qué: Añadir diálogo de confirmación (opcional click para cambiar lista), permitir al usuario elegir su lista de 9 predeterminados (guardar en settings).
Dónde: botones.js y index.html.
Por qué: evita pérdida accidental del layout/selección.
Cómo probar: pulsar cargar predeterminados y verificar confirmación y variaciones.
15) Migración parcial a TypeScript (Opcional)

Qué: Migrar poco a poco módulos críticos a TypeScript o añadir tipos mediante JSDoc.
Dónde: assets/js/* módulos críticos.
Por qué: mayor robustez para colaboradores en JS.
Cómo probar: compilar / comprobar tipo básicos.