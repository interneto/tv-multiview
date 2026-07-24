export const activarTooltipsBootstrap = () => {
    if (typeof window.bootstrap === 'undefined' || !window.bootstrap.Tooltip) return;

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltip) => {
        if (!tooltip || tooltip.getAttribute('data-bs-tooltip-bound') === 'true') return;

        try {
            const instance = new window.bootstrap.Tooltip(tooltip);
            tooltip.setAttribute('data-bs-tooltip-bound', 'true');
            tooltip.__bootstrapTooltipInstance = instance;
        } catch (error) {
            console.warn('Tooltip bootstrap no pudo inicializarse:', error);
        }
    });
};

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
