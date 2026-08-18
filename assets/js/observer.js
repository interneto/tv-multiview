import {
    saveActiveChannelsToStorage as saveChannelsToLocalStorage,
    toggleVisibilityOfRemoveSignalButtons,
    adjustChannelColumnCount,
} from './helpers/index.js';
import {
    CONTAINER_VISION_CUADRICULA as TV_MULTIVIEW_CONTAINER,
    syncInterfaceStatus,
} from './main.js';
import { setPlayerVisibility } from './channelUI.js';

// Cada childList fila/quita un canal dispara el observer; añadir N canales lo
// dispara N veces. Coalescemos la ráfaga en un solo trabajo por frame.
// ponytail: rAF coalesce, switch to leading+trailing debounce if a single batch ever needs both
let frameSolicitado = 0;

// Pausa los canales que salen de viewport (scroll en grids grandes) para no seguir
// gastando ancho de banda/decode en tiles que no se ven, y los reanuda al volver.
const VISIBILITY_OBSERVER = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const canalId = /** @type {HTMLElement} */ (entry.target).dataset.canal;
            if (canalId) setPlayerVisibility(canalId, entry.isIntersecting);
        });
    },
    { threshold: 0.1 },
);

function syncVisibilityObserverTargets() {
    TV_MULTIVIEW_CONTAINER?.querySelectorAll('div[data-canal]').forEach((tile) => {
        VISIBILITY_OBSERVER.observe(tile);
    });
}

function ejecutarTrabajoObserver() {
    frameSolicitado = 0;
    const tareas = [
        adjustChannelColumnCount,
        toggleVisibilityOfRemoveSignalButtons,
        saveChannelsToLocalStorage,
        syncInterfaceStatus,
        syncVisibilityObserverTargets,
    ];
    for (const tarea of tareas) {
        try {
            tarea?.();
        } catch (e) {
            console.error(`Error en ${tarea?.name || 'tarea observer'}:`, e);
        }
    }
    console.info('observer ejecutado');
}

const OBSERVER = new MutationObserver(() => {
    if (frameSolicitado) return;
    frameSolicitado = requestAnimationFrame(ejecutarTrabajoObserver);
});

const OBSERVER_CONFIG = {
    childList: true,
    subtree: false,
    attributes: false,
    characterData: false,
};

if (TV_MULTIVIEW_CONTAINER) {
    OBSERVER.observe(TV_MULTIVIEW_CONTAINER, OBSERVER_CONFIG);
    syncVisibilityObserverTargets();
}
