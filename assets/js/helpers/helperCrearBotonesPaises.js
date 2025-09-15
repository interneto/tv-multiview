import { listChannels } from "../channelsData.js";
import {
    CSS_CLASS_PRIMARY_BUTTON,
    COUNTRY_CODES,
    CHANNEL_CONTAINER_ID_PREFIXES,
} from "../constants/index.js";
import { filtrarCanalesPorInput, mostrarToast } from "./index.js";
import { insertarDivError } from './helperInsertarDivError.js';

export function crearBotonesPaises() {
    try {
        const NUMERO_CANALES_CON_PAIS = Object.values(listChannels).map(canal => {
            if (canal?.country !== '' && typeof canal.country === 'string') {
                return canal.country.toLowerCase();
            } else {
                return 'Desconocido';
            }
        });

        const PAISES_SIN_REPETIRSE = [...new Set(NUMERO_CANALES_CON_PAIS)]

        const CONTEO_NUMERO_CANALES_POR_PAIS = NUMERO_CANALES_CON_PAIS.reduce((conteo, country) => {
            conteo[COUNTRY_CODES[country] ?? 'Desconocido'] = (conteo[COUNTRY_CODES[country] ?? 'Desconocido'] || 0) + 1;
            return conteo;
        }, {});

        const PAISES_ORDENADOS = PAISES_SIN_REPETIRSE.filter(country => COUNTRY_CODES[country]).sort((a, b) => {
            const codigoA = COUNTRY_CODES[a] ? COUNTRY_CODES[a].toLowerCase() : '';
            const codigoB = COUNTRY_CODES[b] ? COUNTRY_CODES[b].toLowerCase() : '';
            return codigoA.localeCompare(codigoB);
        });

        const FRAGMENT_BOTONES_PAISES = document.createDocumentFragment();
        for (const PAIS of PAISES_ORDENADOS) {
            if (COUNTRY_CODES[PAIS]) {
                let namePais = COUNTRY_CODES[PAIS];
                let cantidadCanales = CONTEO_NUMERO_CANALES_POR_PAIS[namePais] || 0;
                let botonPais = document.createElement('button');
                botonPais.setAttribute('type', 'button');
                botonPais.setAttribute('data-country', PAIS);
                botonPais.classList.add(
                    'btn', 'btn-outline-secondary',
                    'd-flex', 'justify-content-between', 'align-items-center',
                    'text-start', 'gap-2', 'w-100', 'm-0', 'rounded-3');
                botonPais.innerHTML =
                    `<span class="flex-grow-1">${namePais}</span>
                    <img src="https://flagcdn.com/${PAIS}.svg" alt="bandera ${namePais}" title="${namePais}" class="svg-bandera rounded-1">
                    <span class="badge bg-secondary">${cantidadCanales}</span>`;
                FRAGMENT_BOTONES_PAISES.append(botonPais);
            }
        }

        if (!PAISES_ORDENADOS.includes('Desconocido')) {
            let cantidadDesconocido = CONTEO_NUMERO_CANALES_POR_PAIS['Desconocido'] || 0;
            let botonDesconocido = document.createElement('button');
            botonDesconocido.setAttribute('type', 'button');
            botonDesconocido.setAttribute('data-country', 'Desconocido');
            botonDesconocido.classList.add('btn', 'btn-outline-secondary', 'd-flex', 'justify-content-between', 'align-items-center', 'text-start', 'gap-2', 'w-100', 'm-0', 'rounded-3');
            botonDesconocido.innerHTML =
                `<span class="flex-grow-1">Desconocido</span><span class="badge bg-secondary">${cantidadDesconocido}</span>`;
            FRAGMENT_BOTONES_PAISES.prepend(botonDesconocido);
        }

        const BOTON_MOSTRAR_TODO_PAIS = document.createElement('button');
            BOTON_MOSTRAR_TODO_PAIS.setAttribute('type', 'button');
            BOTON_MOSTRAR_TODO_PAIS.dataset.country = 'all'
            BOTON_MOSTRAR_TODO_PAIS.classList.add('btn', 'btn-indigo', 'd-flex', 'justify-content-between', 'align-items-center', 'text-start', 'gap-2', 'w-100', 'm-0', 'rounded-3')
            BOTON_MOSTRAR_TODO_PAIS.innerHTML =
                `<span class="flex-grow-1">Todos</span><span class="badge bg-secondary">${Object.keys(listChannels).length}</span>`;
            FRAGMENT_BOTONES_PAISES.prepend(BOTON_MOSTRAR_TODO_PAIS)

        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            const contenedorBotonesFiltroPaises = document.querySelector(`#${PREFIJO}-collapse-botones-listado-filtro-countries`);
            contenedorBotonesFiltroPaises.append(FRAGMENT_BOTONES_PAISES.cloneNode(true));
            contenedorBotonesFiltroPaises.querySelectorAll('button').forEach(botonPaisEnDom => {
                botonPaisEnDom.addEventListener('click', () => {
                    try {
                        let country = botonPaisEnDom.dataset.country;
                        let filtro = COUNTRY_CODES[country] || (country === 'Desconocido' ? 'Desconocido' : country === 'all' ? '' : '');

                        contenedorBotonesFiltroPaises.querySelectorAll('button').forEach(boton => {
                            boton.classList.replace(CSS_CLASS_PRIMARY_BUTTON, 'btn-outline-secondary');
                        });
                        botonPaisEnDom.classList.replace('btn-outline-secondary', CSS_CLASS_PRIMARY_BUTTON);
                        filtrarCanalesPorInput(filtro, document.querySelector(`#${PREFIJO}-body-botones-canales`));
                    } catch (error) {
                        contenedorBotonesFiltroPaises.querySelectorAll('button').forEach(boton => {
                            boton.classList.replace(CSS_CLASS_PRIMARY_BUTTON, 'btn-outline-secondary');
                        });
                        contenedorBotonesFiltroPaises.querySelector('button[data-country="all"]').classList.replace('btn-outline-secondary', CSS_CLASS_PRIMARY_BUTTON);
                        console.error(`Error al intentar activar filtro country. ${error}`);
                        mostrarToast(`
                        <span class="fw-bold">Ha ocurrido un error al intentar activar filtro country..</span>
                        <hr>
                        <span class="bg-dark bg-opacity-25 px-2 rounded-3">Error: ${error}</span>
                        <hr>
                        Si error persiste tras recargar, prueba borrar tu almacenamiento local desde el panel "Personalización" o borrando la caché del navegador.
                        <button type="button" class="btn btn-light rounded-pill btn-sm w-100 border-light mt-2" onclick="location.reload()"> Pulsa para recargar <i class="bi bi-arrow-clockwise"></i></button>`, 'danger', false);
                        return
                    }
                    
                });
            }); 
        }
    } catch (error) {
        console.error(`Error durante creación botones para filtros countries. ${error}`);
        mostrarToast(`
        <span class="fw-bold">Ha ocurrido un error durante la creación de botones para filtrado por country.</span>
        <hr>
        <span class="bg-dark bg-opacity-25 px-2 rounded-3">Error: ${error}</span>
        <hr>
        Si error persiste tras recargar, prueba borrar tu almacenamiento local desde el panel "Personalización" o borrando la caché del navegador.
        <button type="button" class="btn btn-light rounded-pill btn-sm w-100 border-light mt-2" onclick="location.reload()"> Pulsa para recargar <i class="bi bi-arrow-clockwise"></i></button>`, 'danger', false);
        
        for (const PREFIJO of CHANNEL_CONTAINER_ID_PREFIXES) {
            document.querySelector(`#${PREFIJO}-body-botones-canales`).insertAdjacentElement('afterend', insertarDivError(error, 'Ha ocurrido un error durante la creación de botones para filtro countries'));
        }
        return
    }
}