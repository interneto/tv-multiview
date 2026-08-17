/**
 * Compara dos nombres de canal de forma laxa para poder cruzar catálogos que
 * escriben el mismo canal distinto ("CNN" vs "CNN International").
 *
 * Coincide si, en minúsculas, uno contiene al otro. Ojo: con un nombre vacío el
 * resultado siempre es true, porque '' es subcadena de cualquier cosa.
 *
 * @param {unknown} name1
 * @param {unknown} name2
 * @returns {boolean}
 */
export function areSimilarNames(name1, name2) {
    const a = typeof name1 === 'string' ? name1.toLowerCase() : String(name1 || '').toLowerCase();
    const b = typeof name2 === 'string' ? name2.toLowerCase() : String(name2 || '').toLowerCase();
    return a.includes(b) || b.includes(a);
}
