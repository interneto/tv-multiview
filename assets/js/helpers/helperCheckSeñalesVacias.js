import { listaCanales } from "../canalesData.js";

export function revisarSeñalesVacias(canalId) {
    const signals = listaCanales?.[canalId]?.signals;
    if (signals) {
        const todasLasSeñalesVacias = Object.values(signals).every(señal => {
            if (typeof señal === 'undefined' || señal === null) {
                return true;
            } else if (Array.isArray(señal)) {
                return señal.length < 1;
            } else if (typeof señal === 'string') {
                return señal.trim() === '';
            }
        });
        if (todasLasSeñalesVacias) console.error(`${canalId} tiene todas sus signals vacías`);
        return todasLasSeñalesVacias;
    }
    return true; // Si no esta atributo signals, se considera que todas están vacías
}