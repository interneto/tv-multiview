/**
 * Pone texto alternativo a las capturas que `<pwa-install>` pinta en su shadow DOM.
 *
 * El componente monta la galería de `screenshots` del manifiesto con `<img>` sin
 * `alt`, y el `label` que admite el manifiesto no lo usa. Como el markup es suyo
 * y vive en un shadow root, la única forma de arreglarlo desde aquí es rellenar
 * el atributo cuando aparece: sin él, un lector de pantalla lee la ruta del
 * archivo y la auditoría de accesibilidad falla.
 *
 * @module helperPwaInstallA11y
 */

const DEFAULT_MANIFEST_URL = 'site.webmanifest';

/**
 * @param {string} src
 * @returns {string} Nombre de archivo, para casar rutas relativas y absolutas.
 */
function fileName(src) {
    return String(src || '')
        .split('/')
        .pop();
}

/**
 * Espera a que el componente esté definido y mantiene los `alt` al día.
 *
 * @param {string} [selector='pwa-install']
 * @returns {Promise<void>}
 */
export async function fixPwaInstallScreenshotAlt(selector = 'pwa-install') {
    const host = document.querySelector(selector);
    if (!host || !window.customElements) return;

    await customElements.whenDefined('pwa-install').catch(() => {});
    const root = host.shadowRoot;
    if (!root) return;

    /** @type {Record<string, string>} */
    const labels = {};
    try {
        const response = await fetch(host.getAttribute('manifest-url') || DEFAULT_MANIFEST_URL);
        const manifest = await response.json();
        for (const captura of manifest.screenshots ?? []) {
            if (captura.label) labels[fileName(captura.src)] = captura.label;
        }
    } catch {
        // Sin manifiesto seguimos: un alt vacío marca la imagen como decorativa,
        // que sigue siendo mejor que ninguno.
    }

    const aplicar = () => {
        root.querySelectorAll('img:not([alt])').forEach((img) => {
            img.setAttribute('alt', labels[fileName(img.getAttribute('src'))] ?? '');
        });
    };

    aplicar();
    // La galería se pinta al abrir el diálogo de instalación, no al cargar la
    // página. Solo se observan nodos, no atributos: escribir `alt` no se
    // reobserva a sí mismo.
    new MutationObserver(aplicar).observe(root, { childList: true, subtree: true });
}
