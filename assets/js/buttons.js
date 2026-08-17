import { tele } from './main.js';
import { clearChannelBackup } from './channelsData.js';
import {
    aplicarTema,
    mostrarToast,
    playAudioSinDelay,
    removeAllActiveChannels,
    obtenerCanalesPredeterminados,
    showConfirmDialog,
} from './helpers/index.js';
import {
    AUDIO_STATIC_EFFECT as AUDIO_NOTIFICATION,
    AUDIO_FAIL,
    AUDIO_SUCCESS,
    AUDIO_TURN_ON,
} from './constants/index.js';
import { buildErrorToastMessage, t } from './i18n.js';

function getShareData() {
    const urlObj = new URL(window.location.href);
    return {
        title: 'tv-multiview',
        text: t('shareText'),
        url: urlObj.toString(),
    };
}

function renderFullscreenButton(isActive) {
    return isActive
        ? `${t('exitFullscreen')} <i class="bi bi-fullscreen-exit ms-auto"></i>`
        : `${t('enterFullscreen')} <i class="bi bi-arrows-fullscreen ms-auto"></i>`;
}

function renderCopyButton(state = 'idle') {
    if (state === 'success') return `${t('copySuccess')} <i class="bi bi-clipboard-check"></i>`;
    if (state === 'error') return `${t('copyFailed')} <i class="bi bi-clipboard-x"></i>`;
    return `${t('copyLink')} <i class="bi bi-clipboard"></i>`;
}

// MARK: Botón entendido modal descargo de responsabilidad
const BOTON_ENTENDIDO = document.querySelector('#boton-entendido');
BOTON_ENTENDIDO?.addEventListener('click', () => {
    localStorage.setItem('modal-status', 'hide');
});

// MARK: Botón PWA Install
let containerPwaInstall = document.querySelector('#pwa-install');
const BOTON_INSTALAR_PWA = document.querySelector('#boton-instalar-pwa');

// Ocultar botón PWA en Firefox
if (navigator.userAgent.toLowerCase().includes('firefox')) {
    BOTON_INSTALAR_PWA?.classList.add('d-none');
    if (containerPwaInstall) containerPwaInstall.style.display = 'none';
} else {
    // Default behavior: rely on browser's native install banner if it shows.
    // The install button only triggers the `pwa-install` fallback dialog.
    BOTON_INSTALAR_PWA?.addEventListener('click', () => {
        try {
            containerPwaInstall?.showDialog?.(true);
        } catch (error) {
            console.error('Error al mostrar el diálogo de instalación PWA (fallback):', error);
        }
    });
}

// MARK: Botón tema
export const CHECKBOX_PERSONALIZAR_TEMA = document.querySelector('#checkbox-personalizar-tema');
CHECKBOX_PERSONALIZAR_TEMA?.addEventListener('change', () => {
    aplicarTema(CHECKBOX_PERSONALIZAR_TEMA.checked);
});

// MARK: Botón compartir
const BOTON_COMPARTIR = document.querySelector('#boton-compartir');
const CONTENEDOR_BOTONES_COMPARTIR_RRSS = document.querySelector('#contenedor-botones-compartir');

if (navigator.share && BOTON_COMPARTIR) {
    BOTON_COMPARTIR.addEventListener('click', async () => {
        try {
            await navigator.share(getShareData());
        } catch (err) {
            console.error(`Error: ${err}`);
        }
    });
} else {
    BOTON_COMPARTIR?.classList.add('d-none');
    CONTENEDOR_BOTONES_COMPARTIR_RRSS?.classList.replace('d-none', 'd-flex');
}

// MARK: Botón compartir vista (navbar)
const BOTON_COMPARTIR_VISTA = document.querySelector('#boton-compartir-vista');
BOTON_COMPARTIR_VISTA?.addEventListener('click', async () => {
    try {
        await navigator.share(getShareData());
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error(`Error al compartir: ${err}`);
        }
    }
});

// MARK: Botones carga canales predeterminados
function aplicarCanalesPredeterminados(modo) {
    try {
        if (modo === 'replace') {
            document.querySelectorAll('div[data-canal]').forEach((transmision) => {
                tele.remove(transmision.dataset.canal);
            });
        }
        playAudioSinDelay(AUDIO_TURN_ON);
        const yaActivos = new Set(
            Array.from(document.querySelectorAll('div[data-canal]')).map(
                (div) => div.dataset.canal,
            ),
        );
        obtenerCanalesPredeterminados(isMobile?.any)
            .filter((canal) => !yaActivos.has(canal))
            .forEach((canal) => tele.add(canal));
    } catch (error) {
        console.error(`Error durante carga canales predeterminados. Error: ${error}`);
        mostrarToast(buildErrorToastMessage(t('errorLoadDefaultChannels'), error), 'danger', false);
        return;
    }
}

// Cargar los predeterminados borraba la selección del usuario sin avisar. Solo
// preguntamos si hay algo que perder: con la cuadrícula vacía la pregunta sobra.
const cargarCanalesPredeterminados = async () => {
    const activos = document.querySelectorAll('div[data-canal]').length;
    if (activos === 0) {
        aplicarCanalesPredeterminados('replace');
        return;
    }

    const eleccion = await showConfirmDialog({
        title: t('loadDefaultsTitle'),
        body: t('loadDefaultsBody', { count: activos }),
        actions: [
            { id: 'add', label: t('loadDefaultsAdd'), variant: 'btn-light-subtle' },
            { id: 'replace', label: t('loadDefaultsReplace'), variant: 'btn-indigo' },
        ],
    });
    if (!eleccion) return;
    aplicarCanalesPredeterminados(eleccion);
};

export const DEFAULT_CHANNEL_LOAD_BUTTON = document.querySelector(
    '#boton-modal-cargar-canales-por-defecto',
);
export const BUTTON_LOAD_DEFAULT_CHANNELS = document.querySelector(
    '#boton-offcanvas-cargar-canales-por-defecto',
);

DEFAULT_CHANNEL_LOAD_BUTTON?.addEventListener('click', cargarCanalesPredeterminados);
BUTTON_LOAD_DEFAULT_CHANNELS?.addEventListener('click', cargarCanalesPredeterminados);

// MARK: Botones quitar
export const ACTIVE_CHANNEL_REMOVE_ALL_BUTTON = document.querySelector(
    '#boton-modal-quitar-todo-canal-activo',
);
export const BUTTON_REMOVE_ACTIVE_CHANNEL = document.querySelector(
    '#boton-offcanvas-quitar-todo-canal-activo',
);

ACTIVE_CHANNEL_REMOVE_ALL_BUTTON?.addEventListener('click', removeAllActiveChannels);
BUTTON_REMOVE_ACTIVE_CHANNEL?.addEventListener('click', removeAllActiveChannels);

// MARK: Botón borrar localstorage
const BOTON_BORRAR_LOCALSTORAGE = document.querySelector('#boton-borrar-localstorage');
BOTON_BORRAR_LOCALSTORAGE?.addEventListener('click', () => {
    try {
        removeAllActiveChannels();
        localStorage.clear();
        // localStorage.clear() no toca IndexedDB: el backup del catálogo vive ahí
        // desde que dejó de caber cómodo en localStorage.
        clearChannelBackup();
        AUDIO_NOTIFICATION.volume = 0.8;
        AUDIO_NOTIFICATION.loop = true;
        AUDIO_NOTIFICATION.play();
        document.querySelector('#alerta-borrado-localstorage')?.classList.remove('d-none');
    } catch (error) {
        console.error('Error al intentar eliminar almacenamiento local sitio: ', error);
        mostrarToast(
            buildErrorToastMessage(t('errorClearLocalStorage'), error, 'cache'),
            'danger',
            false,
        );
        return;
    }
});

// Mismo botón, pero en la pantalla de "no se pudieron cargar los canales": ahí es
// justo donde hace falta, porque el estado que impide arrancar suele ser un backup
// corrupto. Recarga sola, ya que esa pantalla tapa el resto de la interfaz.
const BOTON_BORRAR_LOCALSTORAGE_ERROR_CARGA = document.querySelector(
    '#boton-borrar-localstorage-no-carga-canales',
);
BOTON_BORRAR_LOCALSTORAGE_ERROR_CARGA?.addEventListener('click', async () => {
    try {
        localStorage.clear();
        await clearChannelBackup();
    } catch (error) {
        console.error('Error al intentar eliminar almacenamiento local sitio: ', error);
    } finally {
        location.reload();
    }
});

// MARK: Botón fullscreen
function enterFullscreen() {
    const element = document.documentElement;
    try {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } catch (error) {
        console.error(`Error al solicitar entrar a pantalla completa. Error: ${error}`);
        mostrarToast(
            buildErrorToastMessage(t('errorEnterFullscreen'), error, 'cache'),
            'danger',
            false,
        );
        return;
    }
}

function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } catch (error) {
        console.error(`Error al solicitar salir de pantalla completa. Error: ${error}`);
        mostrarToast(
            buildErrorToastMessage(t('errorExitFullscreen'), error, 'cache'),
            'danger',
            false,
        );
        return;
    }
}

function isFullscreenSupported() {
    return !!(
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
    );
}

function isFullscreen() {
    return (
        isFullscreenSupported() &&
        !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
            /* || window.innerHeight == screen.height */
        )
    );
}

const BOTON_FULLSCREEN = document.querySelector('#boton-fullscreen');
BOTON_FULLSCREEN?.addEventListener('click', () => {
    isFullscreen() ? exitFullscreen() : enterFullscreen();
});

if (!isFullscreenSupported() && BOTON_FULLSCREEN?.parentElement?.parentElement) {
    BOTON_FULLSCREEN.parentElement.parentElement.classList.toggle('d-none');
}

function handleFullscreenChange() {
    if (!BOTON_FULLSCREEN) return;
    isFullscreen()
        ? ((BOTON_FULLSCREEN.innerHTML = renderFullscreenButton(true)),
          BOTON_FULLSCREEN.classList.replace('btn-light-subtle', 'btn-indigo'))
        : ((BOTON_FULLSCREEN.innerHTML = renderFullscreenButton(false)),
          BOTON_FULLSCREEN.classList.replace('btn-indigo', 'btn-light-subtle'));
}

/* window.addEventListener('resize', handleFullscreenChange); */

document.addEventListener('keydown', (event) => {
    if (event.key === 'F11') {
        event.preventDefault();
        isFullscreen() ? exitFullscreen() : enterFullscreen();
    }
});

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);
window.addEventListener('ui-language-change', handleFullscreenChange);
handleFullscreenChange();

// MARK: Botón copiar enlace
const SHARE_LINK_BUTTON = document.querySelector('#boton-copiar-enlace-compartir');
const INPUT_ENLACE_COMPARTIR = document.querySelector('#input-enlace-compartir');

SHARE_LINK_BUTTON?.addEventListener('click', async () => {
    try {
        INPUT_ENLACE_COMPARTIR?.select?.();
        if (navigator.clipboard && INPUT_ENLACE_COMPARTIR) {
            await navigator.clipboard.writeText(INPUT_ENLACE_COMPARTIR.value);
            playAudioSinDelay(AUDIO_SUCCESS);
            SHARE_LINK_BUTTON.innerHTML = renderCopyButton('success');
            SHARE_LINK_BUTTON.classList.add('bg-success');
        } else {
            throw new Error('Clipboard API no soportada o input no encontrado');
        }
    } catch (error) {
        console.error('Error al copiar el enlace usando navigator.clipboard: ', error);
        try {
            document.execCommand('copy', false, INPUT_ENLACE_COMPARTIR?.value ?? '');
            playAudioSinDelay(AUDIO_SUCCESS);
            SHARE_LINK_BUTTON.innerHTML = renderCopyButton('success');
            SHARE_LINK_BUTTON.classList.add('bg-success');
        } catch (execError) {
            console.error('Error al copiar el enlace usando execCommand: ', execError);
            playAudioSinDelay(AUDIO_FAIL);
            SHARE_LINK_BUTTON.innerHTML = renderCopyButton('error');
            SHARE_LINK_BUTTON.classList.add('bg-danger');
            return;
        }
    } finally {
        setTimeout(() => {
            if (SHARE_LINK_BUTTON) {
                SHARE_LINK_BUTTON.innerHTML = renderCopyButton();
                SHARE_LINK_BUTTON.classList.remove('bg-success', 'bg-danger');
            }
        }, 2000);
    }
});

window.addEventListener('ui-language-change', () => {
    handleFullscreenChange();
    if (SHARE_LINK_BUTTON) {
        SHARE_LINK_BUTTON.innerHTML = renderCopyButton();
    }
});

if (SHARE_LINK_BUTTON) {
    SHARE_LINK_BUTTON.innerHTML = renderCopyButton();
}
