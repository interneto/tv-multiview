export function areSimilarNames(name1, name2) {
    const a = typeof name1 === 'string' ? name1.toLowerCase() : String(name1 || '').toLowerCase();
    const b = typeof name2 === 'string' ? name2.toLowerCase() : String(name2 || '').toLowerCase();
    return a.includes(b) || b.includes(a);
}