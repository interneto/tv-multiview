// Funciones para crear overlays y fragmentos de canal
import { listChannels } from './channelsData.js';
import { LABEL_MODAL_CAMBIAR_CANAL, MODAL_CAMBIAR_CANAL, tele } from './main.js';
import {
    COUNTRY_CODES,
    CATEGORY_ICONS,
    AUDIO_POP,
    TWITCH_BASE_URL
} from './constants/index.js';
import { mostrarToast, playAudioSinDelay, hideTextoBotonesOverlay } from './helpers/index.js';

// Funciones de UI de canales extraídas de main.js
function savePreferredSignal(canalId, señalUtilizar = '', indexSeñalUtilizar = 0) {
    let lsPreferenciasSeñalCanales = JSON.parse(localStorage.getItem('preferencia-señal-canales')) || {};
    lsPreferenciasSeñalCanales[canalId] = { [señalUtilizar]: indexSeñalUtilizar };
    localStorage.setItem('preferencia-señal-canales', JSON.stringify(lsPreferenciasSeñalCanales));
}

export function generateStreamIframe(canalId, tipoSeñalParaIframe, valorIndex = 0) {
    valorIndex = Number(valorIndex)
    const DIV_ELEMENT = document.createElement('div');
    DIV_ELEMENT.classList.add('ratio', 'ratio-16x9', 'h-100');
    DIV_ELEMENT.setAttribute('data-canal-cambio', canalId);
    const { name, signals } = listChannels[canalId];

    const URL_POR_TIPO_SEÑAL = {
        'iframe_url': signals.iframe_url && signals.iframe_url[valorIndex],
        'yt_id': signals.yt_id && `https://www.youtube-nocookie.com/embed/live_stream?channel=${signals.yt_id}&autoplay=1&mute=1&modestbranding=1&vq=medium&showinfo=0`,
        'yt_embed': signals.yt_embed && `https://www.youtube-nocookie.com/embed/${signals.yt_embed}?autoplay=1&mute=1&modestbranding=1&showinfo=0`,
        'yt_playlist': signals.yt_playlist && `https://www.youtube-nocookie.com/embed/videoseries?list=${signals.yt_playlist}&autoplay=0&mute=0&modestbranding=1&showinfo=0`,
        'twitch_id': signals.twitch_id && `https://player.twitch.tv/?channel=${signals.twitch_id}&parent=${TWITCH_BASE_URL}`
    };

    const IFRAME_ELEMENT = document.createElement('iframe');
    IFRAME_ELEMENT.src = URL_POR_TIPO_SEÑAL[tipoSeñalParaIframe];
    IFRAME_ELEMENT.classList.add('pe-auto');
    IFRAME_ELEMENT.setAttribute('contenedor-canal-cambio', canalId);
    IFRAME_ELEMENT.allowFullscreen = true;
    IFRAME_ELEMENT.title = name;
    IFRAME_ELEMENT.referrerPolicy = 'no-referrer';

    DIV_ELEMENT.append(IFRAME_ELEMENT);
    return DIV_ELEMENT;
}


export function createVideoPlayer(canalId, urlCarga) {
    const DIV_ELEMENT = document.createElement('div');
    DIV_ELEMENT.setAttribute('data-canal-cambio', canalId);
    DIV_ELEMENT.classList.add('ratio', 'ratio-16x9', 'h-100');
    const videoElement = document.createElement('video');
    videoElement.setAttribute('contenedor-canal-cambio', canalId);
    videoElement.classList.add('position-absolute', 'p-0', 'video-js', 'vjs-16-9', 'vjs-fill', 'overflow-hidden');
    videoElement.toggleAttribute('controls');
    DIV_ELEMENT.append(videoElement);
    videojs(videoElement).src({
        src: urlCarga,
        controls: true,
    });
    videojs(videoElement).autoplay('muted');
    return DIV_ELEMENT;
}

export function createChannelOverlay(canalId, tipoSeñalCargada, valorIndex = 0) {
    try {
    let { name = 'Nombre Canal', signals, website, country, category } = listChannels[canalId];

    valorIndex = Number(valorIndex);
    category = typeof category === 'string' ? category.toLowerCase() : '';
    let iconoCategoria = (typeof category === 'string' && category in CATEGORY_ICONS) ? CATEGORY_ICONS[category] : '<i class="bi bi-tv"></i>';

        const FRAGMENT_OVERLAY = document.createDocumentFragment();
        const DIV_ELEMENT = document.createElement('div');
        DIV_ELEMENT.id = `overlay-de-canal-${canalId}`;
        DIV_ELEMENT.classList.add('position-absolute', 'w-100', 'h-100', 'bg-transparent', 'pe-none', 'me-1', 'd-flex', 'gap-2', 'justify-content-end', 'align-items-start', 'flex-wrap', 'top-0', 'end-0', 'barra-overlay');

        const BOTON_SELECCIONAR_SEÑAL_CANAL = document.createElement("button");
        BOTON_SELECCIONAR_SEÑAL_CANAL.id = 'overlay-boton-selecionar-señal'
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('type', 'button');
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('title', 'Seleccionar diferente señal');
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('data-bs-toggle', 'dropdown');
        BOTON_SELECCIONAR_SEÑAL_CANAL.setAttribute('aria-expanded', 'false');

        BOTON_SELECCIONAR_SEÑAL_CANAL.innerHTML = '<span>Seleccionar señal</span><i class="bi bi-collection" data-bs-toggle="tooltip" data-bs-title="Seleccionar diferente señal"></i>';
        BOTON_SELECCIONAR_SEÑAL_CANAL.classList.add('btn', 'btn-sm', 'btn-dark-subtle', 'dropdown-toggle', 'd-flex', 'justify-content-center', 'align-items-center', 'gap-1', 'p-0', 'px-1', 'pe-auto', 'mt-1', 'rounded-3');

        const DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL = document.createElement("ul");
        DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.classList.add('dropdown-menu');

        for (const key in signals) {
            let iconoSeñal = '<i class="bi bi-globe"></i>'
            if (key.startsWith('iframe_')) {
                iconoSeñal = '<i class="bi bi-globe"></i>'
            } else if (key.startsWith('m3u8_')) {
                iconoSeñal = '<i class="bi bi-play-btn"></i>'
            } else if (key.startsWith('yt_')) {
                iconoSeñal = '<i class="bi bi-youtube"></i>'
            } else if (key.startsWith('twitch_')) {
                iconoSeñal = '<i class="bi bi-twitch"></i>'
            }

            const value = signals[key];
            if (Array.isArray(value) && value.length > 0) {
                value.forEach((url, index) => {
                    const listItem = document.createElement("li");
                    listItem.classList.add('dropdown-item', 'pe-auto', 'py-2', 'user-select-none');
                    if (tipoSeñalCargada === key && valorIndex === index) listItem.classList.add('bg-indigo', 'fw-bold');
                    listItem.innerHTML = value.length === 1 ? `${iconoSeñal} ${key.split('_')[0]}` : `${iconoSeñal} ${key.split('_')[0]} <span class="fst-italic">${index}</span>`;
                    listItem.addEventListener("click", () => {
                        DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.querySelectorAll('.dropdown-item').forEach(item => {
                            item.classList.remove('bg-indigo', 'fw-bold');
                        });
                        listItem.classList.add('bg-indigo', 'fw-bold');
                        savePreferredSignal(canalId, key.toString(), Number(index));
                        updateActiveSignal(canalId);
                    });
                    DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.append(listItem);
                });
            } else if (typeof value === "string" && value !== "") {
                const listItem = document.createElement("li");
                listItem.classList.add('dropdown-item', 'pe-auto', 'py-2', 'user-select-none');
                if (tipoSeñalCargada === key) listItem.classList.add('bg-indigo', 'fw-bold');
                listItem.innerHTML = `${iconoSeñal} ${key.replace('_', ' ')}`;
                listItem.addEventListener("click", () => {
                    DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.querySelectorAll('.dropdown-item').forEach(item => {
                        item.classList.remove('bg-indigo', 'fw-bold');
                    });
                    listItem.classList.add('bg-indigo', 'fw-bold');
                    savePreferredSignal(canalId, key.toString());
                    updateActiveSignal(canalId);
                });
                DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL.append(listItem);
            }
        }

        const MOVE_CHANNEL_BUTTON = document.createElement('button');
        MOVE_CHANNEL_BUTTON.id = 'overlay-boton-mover';
        MOVE_CHANNEL_BUTTON.setAttribute('type', 'button');
        MOVE_CHANNEL_BUTTON.setAttribute('title', 'Arrastrar y mover este canal');
        MOVE_CHANNEL_BUTTON.setAttribute('data-bs-toggle', 'tooltip');
        MOVE_CHANNEL_BUTTON.setAttribute('data-bs-title', 'Arrastrar y mover este canal');
        MOVE_CHANNEL_BUTTON.innerHTML = '<span>Mover</span><i class="bi bi-arrows-move"></i>';
        MOVE_CHANNEL_BUTTON.classList.add('btn', 'btn-sm', 'btn-dark-subtle', 'p-0', 'px-1', 'd-flex', 'gap-1', 'pe-auto', 'mt-1', 'rounded-3', 'clase-para-mover');

        const CHANGE_CHANNEL_BUTTON = document.createElement('button');
        CHANGE_CHANNEL_BUTTON.id = 'overlay-boton-cambiar';
        CHANGE_CHANNEL_BUTTON.setAttribute('type', 'button');
        CHANGE_CHANNEL_BUTTON.setAttribute('title', 'Cambiar este canal');
        CHANGE_CHANNEL_BUTTON.setAttribute('data-bs-toggle', 'tooltip');
        CHANGE_CHANNEL_BUTTON.setAttribute('data-bs-title', 'Cambiar este canal');
        CHANGE_CHANNEL_BUTTON.setAttribute('data-button-cambio', canalId);
        CHANGE_CHANNEL_BUTTON.innerHTML = '<span>Cambiar</span><i class="bi bi-arrow-repeat"></i>';
        CHANGE_CHANNEL_BUTTON.classList.add('btn', 'btn-sm', 'btn-dark-subtle', 'p-0', 'px-1', 'd-flex', 'gap-1', 'pe-auto', 'mt-1', 'rounded-3');
        CHANGE_CHANNEL_BUTTON.addEventListener('click', () => {
            LABEL_MODAL_CAMBIAR_CANAL.textContent = name;
            LABEL_MODAL_CAMBIAR_CANAL.setAttribute('id-canal-cambio', canalId);
            new bootstrap.Modal(MODAL_CAMBIAR_CANAL).show();
        });

        const OFFICIAL_CHANNEL_LINK = document.createElement('a');
        OFFICIAL_CHANNEL_LINK.id = 'overlay-boton-pagina-oficial';
        OFFICIAL_CHANNEL_LINK.title = 'Ir a la página oficial de esta transmisión';
        if (tipoSeñalCargada === 'yt_id') website = `https://www.youtube.com/channel/${signals.yt_id}`;
        if (tipoSeñalCargada === 'twitch_id') website = `https://www.twitch.tv/${signals.twitch_id}`;
        OFFICIAL_CHANNEL_LINK.href = website !== '' ? website : `https://www.qwant.com/?q=${name}+en+vivo`;
        OFFICIAL_CHANNEL_LINK.setAttribute('role', 'button');
        OFFICIAL_CHANNEL_LINK.setAttribute('data-bs-toggle', 'tooltip');
        OFFICIAL_CHANNEL_LINK.setAttribute('data-bs-title', 'Ir a la página oficial de esta transmisión');
        OFFICIAL_CHANNEL_LINK.rel = 'noopener nofollow noreferrer';
        OFFICIAL_CHANNEL_LINK.innerHTML = `<span>
                ${name}
                ${country && typeof country === 'string' && COUNTRY_CODES[country]
                ? ` <img src="https://flagcdn.com/${country.toLowerCase()}.svg" alt="bandera ${COUNTRY_CODES[country]}" title="${COUNTRY_CODES[country]}" class="svg-bandera">`
                : ''}
                ${iconoCategoria
                ? ` ${iconoCategoria}`
                : ''}
                </span> <i class="bi bi-box-arrow-up-right"></i>`;
        OFFICIAL_CHANNEL_LINK.classList.add('btn', 'btn-sm', 'btn-dark-subtle', 'p-0', 'px-1', 'd-flex', 'gap-1', 'pe-auto', 'mt-1', 'rounded-3', 'text-nowrap');

        const REMOVE_CHANNEL_BUTTON = document.createElement('button');
        REMOVE_CHANNEL_BUTTON.id = 'overlay-boton-quitar';
        REMOVE_CHANNEL_BUTTON.setAttribute('aria-label', 'Close');
        REMOVE_CHANNEL_BUTTON.setAttribute('type', 'button');
        REMOVE_CHANNEL_BUTTON.setAttribute('title', 'Quitar canal');
        REMOVE_CHANNEL_BUTTON.setAttribute('data-bs-toggle', 'tooltip');
        REMOVE_CHANNEL_BUTTON.setAttribute('data-bs-title', 'Quitar canal');
        REMOVE_CHANNEL_BUTTON.innerHTML = '<span>Quitar</span><i class="bi bi-x-circle"></i>';
        REMOVE_CHANNEL_BUTTON.classList.add('btn', 'btn-sm', 'btn-danger', 'p-0', 'px-1', 'd-flex', 'gap-1', 'pe-auto', 'mt-1', 'rounded-3');
        REMOVE_CHANNEL_BUTTON.addEventListener('click', () => {
            tele.remove(canalId);
            playAudioSinDelay(AUDIO_POP);
        });

        DIV_ELEMENT.append(BOTON_SELECCIONAR_SEÑAL_CANAL);
        DIV_ELEMENT.append(DROPDOWN_MENU_SELECCIONAR_SEÑAL_CANAL);
        DIV_ELEMENT.append(MOVE_CHANNEL_BUTTON);
        DIV_ELEMENT.append(CHANGE_CHANNEL_BUTTON);
        DIV_ELEMENT.append(OFFICIAL_CHANNEL_LINK);
        DIV_ELEMENT.append(REMOVE_CHANNEL_BUTTON);
        FRAGMENT_OVERLAY.append(DIV_ELEMENT);
        return FRAGMENT_OVERLAY;
    } catch (error) {
        console.error(`Error durante creación overlay para canal con id: ${canalId}. Error: ${error}`);
        mostrarToast(`
        <span class="fw-bold">Ha ocurrido un error durante la creación del overlay para el canal con id: ${canalId}.</span>
        <hr>
        <span class="bg-dark bg-opacity-25 px-2 rounded-3">Error: ${error}</span>
        <hr>
        Si error persiste tras recargar, prueba borrar tu almacenamiento local desde el panel "Personalización" o borrando la caché del navegador.
        <button type="button" class="btn btn-light rounded-pill btn-sm w-100 border-light mt-2" onclick="location.reload()"> Pulsa para recargar <i class="bi bi-arrow-clockwise"></i></button>`, 'danger')
        return
    }
}

export function createChannelFragment(canalId) {
    if (listChannels[canalId]?.signals) {
        let { iframe_url = [], m3u8_url = [], yt_id = '', yt_embed = '', yt_playlist = '', twitch_id = '' } = listChannels[canalId].signals;
        let lsPreferenciasSeñalCanales = JSON.parse(localStorage.getItem('preferencia-señal-canales')) || {};

        let señalUtilizar;
        let valorIndexArraySeñal = 0;

        if (Array.isArray(iframe_url) && iframe_url.length > 0) {
            señalUtilizar = 'iframe_url';
        } else if (Array.isArray(m3u8_url) && m3u8_url.length > 0) {
            señalUtilizar = 'm3u8_url';
        } else if (yt_id !== '') {
            señalUtilizar = 'yt_id';
        } else if (yt_embed !== '') {
            señalUtilizar = 'yt_embed';
        } else if (yt_playlist !== '') {
            señalUtilizar = 'yt_playlist';
        } else if (twitch_id !== '') {
            señalUtilizar = 'twitch_id';
        }

        if (lsPreferenciasSeñalCanales[canalId]) {
            señalUtilizar = Object.keys(lsPreferenciasSeñalCanales[canalId])[0].toString()
            valorIndexArraySeñal = Number(Object.values(lsPreferenciasSeñalCanales[canalId]))
        }

        const FRAGMENT_CANAL = document.createDocumentFragment();
        if (señalUtilizar === 'm3u8_url') {
            FRAGMENT_CANAL.append(
                createVideoPlayer(canalId, m3u8_url[valorIndexArraySeñal]),
                createChannelOverlay(canalId, 'm3u8_url', valorIndexArraySeñal)
            );
            return FRAGMENT_CANAL;
        } else {
            FRAGMENT_CANAL.append(
                generateStreamIframe(canalId, señalUtilizar, valorIndexArraySeñal),
                createChannelOverlay(canalId, señalUtilizar, valorIndexArraySeñal)
            );
            return FRAGMENT_CANAL;
        }
    } else {
        console.error(`${canalId} no tiene signals definidas.`);
        mostrarToast(`
        <span class="fw-bold">${canalId}</span> no tiene signals definidas. 
        <br>Prueba recargando o borrar la caché del navegador.
        <button type="button" class="btn btn-danger rounded-pill btn-sm w-100 border-light mt-2" data-bs-toggle="modal"
            data-bs-target="#modal-reset">Probar reiniciar almacenamiento local</button>`, 'danger', false);
    }
}

export function updateActiveSignal(canalId) {
    try {
        if (!canalId) return console.error(`El canal "${canalId}" proporcionado no es válido para cambio señal.`);

        let divPadreACambiar = document.querySelector(`div[data-canal="${canalId}"]`);
        let divExistenteACambiar = divPadreACambiar.querySelector(`div[data-canal-cambio="${canalId}"]`);
        let barraOverlayDeCanalACambiar = divPadreACambiar.querySelector(`#overlay-de-canal-${canalId}`);

        divExistenteACambiar.remove();
        barraOverlayDeCanalACambiar.remove();

        divPadreACambiar.append(createChannelFragment(canalId));

        if (typeof activarTooltipsBootstrap === 'function') activarTooltipsBootstrap();
        if (typeof hideTextoBotonesOverlay === 'function') hideTextoBotonesOverlay();
    } catch (error) {
        console.error(`Error al intentar cambiar señal para canal con id: ${canalId}. Error: ${error}`);
        mostrarToast(`
        <span class="fw-bold">Ha ocurrido un error al intentar cambiar señal para canal con id: ${canalId}.</span>
        <hr>
        <span class="bg-dark bg-opacity-25 px-2 rounded-3">Error: ${error}</span>
        <hr>
        Si error persiste tras recargar, prueba borrar tu almacenamiento local desde el panel "Personalización" o borrando la caché del navegador.
        <button type="button" class="btn btn-light rounded-pill btn-sm w-100 border-light mt-2" onclick="location.reload()"> Pulsa para recargar <i class="bi bi-arrow-clockwise"></i></button>`, 'danger');
        return;
    }
}