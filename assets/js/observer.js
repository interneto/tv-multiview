import { saveActiveChannelsToStorage as saveChannelsToLocalStorage, toggleVisibilityOfRemoveSignalButtons, adjustChannelColumnCount} from './helpers/index.js';
import { CONTAINER_VISION_CUADRICULA as TV_MULTIVIEW_CONTAINER } from "./main.js";

const OBSERVER = new MutationObserver(() => {
    try {
        adjustChannelColumnCount?.();
    } catch (e) {
        console.error('Error en adjustChannelColumnCount:', e);
    }
    try {
        toggleVisibilityOfRemoveSignalButtons?.();
    } catch (e) {
        console.error('Error en toggleVisibilityOfRemoveSignalButtons:', e);
    }
    try {
        saveChannelsToLocalStorage?.();
    } catch (e) {
        console.error('Error en saveChannelsToLocalStorage:', e);
    }
    console.info('observer ejecutado');
});

const OBSERVER_CONFIG = {
    childList: true,
    subtree: false,
    attributes: false,
    characterData: false
};

if (TV_MULTIVIEW_CONTAINER) {
    OBSERVER.observe(TV_MULTIVIEW_CONTAINER, OBSERVER_CONFIG);
}