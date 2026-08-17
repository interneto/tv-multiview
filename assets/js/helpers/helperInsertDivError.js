/**
 * Construye un bloque de alerta con el detalle de un error, listo para insertar.
 *
 * @param {unknown} error Error o texto a mostrar como detalle.
 * @param {string} [mensaje='Error'] Titular de la alerta.
 * @returns {HTMLDivElement}
 */
export function insertarDivError(error, mensaje = 'Error') {
    const DIV = document.createElement('div');
    DIV.classList.add('alert', 'alert-danger', 'p-2', 'rounded-2', 'my-2');
    DIV.setAttribute('role', 'alert');
    const contenido = `
        <div class="fw-bold">${mensaje}</div>
        <div class="small text-monospace text-break">${String(error)}</div>
    `;
    DIV.innerHTML = contenido;
    return DIV;
}
