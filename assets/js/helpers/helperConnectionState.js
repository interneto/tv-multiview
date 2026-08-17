/**
 * Muestra u oculta el aviso de "sin conexión" según `navigator.onLine`.
 * @returns {void}
 */
function revisarConexion() {
    const alertaInternetStatus = document.querySelector('#alerta-internet-status');
    if (!alertaInternetStatus) return; // Seguridad: evita error si el elemento no existe

    if (navigator.onLine) {
        alertaInternetStatus.classList.add('d-none');
    } else {
        alertaInternetStatus.classList.remove('d-none');
    }
}

/**
 * Activa la detección automática de conexión. Llamar una sola vez al arrancar.
 * @returns {void}
 */
export function iniciarRevisarConexion() {
    revisarConexion(); // Ejecutar inmediatamente al importar
    window.addEventListener('online', revisarConexion);
    window.addEventListener('offline', revisarConexion);
}
