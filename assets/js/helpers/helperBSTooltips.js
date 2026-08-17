/**
 * Inicializa los tooltips de Bootstrap que aún no lo estén.
 *
 * Marca cada elemento ya inicializado para no crear instancias duplicadas al
 * volver a llamarla tras redibujar canales.
 *
 * @returns {void}
 */
export const activarTooltipsBootstrap = () => {
    if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Tooltip) return;

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltip) => {
        const el = /** @type {HTMLElement & {__bootstrapTooltipInstance?: bootstrap.Tooltip}} */ (tooltip);
        if (!el || el.getAttribute('data-bs-tooltip-bound') === 'true') return;

        try {
            const instance = new window.bootstrap.Tooltip(el);
            el.setAttribute('data-bs-tooltip-bound', 'true');
            el.__bootstrapTooltipInstance = instance;
        } catch (error) {
            console.warn('Tooltip bootstrap no pudo inicializarse:', error);
        }
    });
};

/**
 * Destruye los tooltips activos. Necesario antes de mover canales: un tooltip
 * abierto sobre el botón que se arrastra se queda flotando huérfano.
 *
 * @returns {void}
 */
export const removerTooltipsBootstrap = () => {
    if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Tooltip) return;

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltip) => {
        if (!tooltip) return;

        const instance = tooltip.__bootstrapTooltipInstance;
        if (instance && typeof instance.dispose === 'function') {
            instance.dispose();
        }

        tooltip.removeAttribute('data-bs-tooltip-bound');
        delete tooltip.__bootstrapTooltipInstance;
    });
};
