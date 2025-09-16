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
