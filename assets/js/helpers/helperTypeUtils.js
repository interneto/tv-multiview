/**
 * Utilidades para casteo de tipos en el contexto de type-checking con checkJs.
 * Estas funciones son no-ops en runtime pero ayudan TypeScript a entender los tipos.
 * @module helperTypeUtils
 */

/**
 * Castea un Element a HTMLElement de forma segura.
 * @template {HTMLElement} T
 * @param {Element} el Elemento a castear.
 * @returns {T} El elemento casteado.
 */
export function asHTMLElement(el) {
    return /** @type {any} */ (el);
}

/**
 * Castea un NodeList a un array de HTMLElements.
 * @param {NodeListOf<Element>} nodeList
 * @returns {HTMLElement[]}
 */
export function nodeListToHTMLArray(nodeList) {
    return Array.from(nodeList).map((el) => asHTMLElement(el));
}

/**
 * Castea un valor a un tipo específico.
 * @template T
 * @param {any} value Valor a castear.
 * @returns {T} Valor casteado.
 */
export function cast(value) {
    return value;
}
