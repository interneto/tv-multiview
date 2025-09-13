# To Do

## Nuevas opciones

- Ampliar el listado [tv-channels](./json-teles/tv-channels.json)
- Añadir filtrado de canales por temática
- Comprobar si los canales están activos

----

## Mejoras

Aquí tienes un **resumen priorizado** de las mejoras:

### Alta prioridad

- [x] **README inicial** → Explicar propósito, estructura, instrucciones y validaciones.
- [x] **package.json + scripts** → Centralizar comandos (`start`, `lint`, `format`, `test`, `check-json`).
- [x] **Validación JSON con schema** → Evitar datos malformados.

### Media-Alta

- [x] **CI (GitHub Actions)** → Automatizar lint, validación, tests.

### Media

- [ ] **Lint y formateo** → Uniformidad de código.
- [ ] **Estado en URL** → Permitir compartir/restaurar vistas.
- [ ] **IndexedDB** → Persistencia más robusta que localStorage.
- [ ] **PWA / Service Worker** → Mejorar cache y rendimiento offline.
- [ ] **Accesibilidad (a11y)** → Roles ARIA, foco, contraste, Lighthouse.

### Media-Baja

- [ ] **Tests helpers** → Validar transformaciones y evitar regresiones.
- [ ] **Errores y reintentos en fetch** → Mejor tolerancia a fallas de red.

### Baja

- [ ] **Documentación API y helpers** → JSDoc y docs básicos.
- [ ] **Optimización de imágenes** → WebP, compresión, srcset.
- [ ] **UX en “Cargar predeterminados”** → Confirmaciones y personalización.

### Opcional

- [ ] **Migración parcial a TypeScript** → Más robustez y tipado progresivo.
