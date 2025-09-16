import { listChannels } from "../channelsData.js";
import { CSS_CLASS_SECONDARY_BUTTON, COUNTRY_CODES, CATEGORY_ICONS, CHANNEL_CONTAINER_ID_PREFIXES } from "../constants/index.js";
import { CONTAINER_VIDEO_VISION_UNICA, tele } from "../main.js";
import { mostrarToast, revisarSeñalesVacias, guardarOrdenOriginal } from "./index.js";
import { insertarDivError } from './helperInsertarDivError.js';

export function crearBotonesParaCanales() {
    try {
        const FRAGMENT_BOTONES_CANALES = document.createDocumentFragment();
        for (const canal of Object.keys(listChannels)) {
            let { name, /* logo, */ country, category } = listChannels[canal];
            category = typeof category === 'string' ? category.toLowerCase() : '';
            let iconoCategoria = category && (category in CATEGORY_ICONS) ? CATEGORY_ICONS[category] : '<i class="bi bi-tv"></i>';
            let namePais = country && typeof country === 'string' && COUNTRY_CODES[country.toLowerCase()] ? COUNTRY_CODES[country.toLowerCase()] : 'Desconocido';

            let botonCanal = document.createElement('button');
            botonCanal.setAttribute('data-canal', canal);
            botonCanal.setAttribute('data-country', `${namePais}`);
            botonCanal.classList.add('btn', CSS_CLASS_SECONDARY_BUTTON, 'd-flex', 'justify-content-between', 'align-items-center', 'gap-2', 'text-start', 'rounded-3');
            if (revisarSeñalesVacias(canal)) botonCanal.classList.add('d-none');
            botonCanal.innerHTML =
                `<span class="flex-grow-1">${name}</span>
                    ${country && typeof country === 'string' && COUNTRY_CODES[country.toLowerCase()] ? `<img src="https://flagcdn.com/${country.toLowerCase()}.svg" alt="bandera ${namePais}" title="${namePais}" class="svg-bandera rounded-1">` : ''}
                    ${iconoCategoria ? `${iconoCategoria}` : ''}`;
            // ${logo ? `<img src="${logo}" alt="logo ${name}" title="logo ${name}" class="img-logos rounded-1">` : ''}
            FRAGMENT_BOTONES_CANALES.append(botonCanal);
        }

        document.querySelector('#modal-canales-body-botones-canales').append(FRAGMENT_BOTONES_CANALES.cloneNode(true));
        document.querySelector('#offcanvas-canales-body-botones-canales').append(FRAGMENT_BOTONES_CANALES.cloneNode(true));
        document.querySelector('#modal-cambiar-canal-body-botones-canales').append(FRAGMENT_BOTONES_CANALES.cloneNode(true));
        document.querySelector('#vision-unica-body-botones-canales').append(FRAGMENT_BOTONES_CANALES.cloneNode(true));

        // Asignar eventos después de que los botones estén en el DOM
        document.querySelectorAll('#modal-canales-body-botones-canales button, #offcanvas-canales-body-botones-canales button').forEach(botonCanalEnDOM => {
            botonCanalEnDOM.addEventListener('click', () => {
                let accionBoton = botonCanalEnDOM.classList.contains(CSS_CLASS_SECONDARY_BUTTON) ? 'add' : 'remove';
                tele[accionBoton](botonCanalEnDOM.dataset.canal);
            });
        });

        document.querySelectorAll('#modal-cambiar-canal-body-botones-canales button').forEach(botonCanalEnDOM => {
            botonCanalEnDOM.setAttribute('data-bs-dismiss', 'modal');
        });

        document.querySelectorAll('#vision-unica-body-botones-canales button').forEach(botonCanalEnDOM => {
            botonCanalEnDOM.addEventListener('click', () => {
                if (CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]')) {
                    tele.remove(CONTAINER_VIDEO_VISION_UNICA.querySelector('div[data-canal]').dataset.canal)
                }

                let accionBoton = botonCanalEnDOM.classList.contains(CSS_CLASS_SECONDARY_BUTTON) ? 'add' : 'remove';
                tele[accionBoton](botonCanalEnDOM.dataset.canal);
            });
        });

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            guardarOrdenOriginal(`${PREFIJO}-body-botones-canales`);
        }

    } catch (error) {
        console.error(`Error durante creación botones para canales. Error: ${error}`);
        mostrarToast(`
        <span class="fw-bold">Ha ocurrido un error durante la creación de botones para los canales.</span>
        <hr>
        <span class="bg-dark bg-opacity-25 px-2 rounded-3">Error: ${error}</span>
        <hr>
        Si error persiste tras recargar, prueba borrar tu almacenamiento local desde el panel "Personalización" o borrando la caché del navegador.
        <button type="button" class="btn btn-light rounded-pill btn-sm w-100 border-light mt-2" onclick="location.reload()"> Pulsa para recargar <i class="bi bi-arrow-clockwise"></i></button>`, 'danger', false);

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            document.querySelector(`#${PREFIJO}-body-botones-canales`).insertAdjacentElement('afterend', insertarDivError(error, 'Ha ocurrido un error durante la creación de botones para los canales'));
        }
    }
}