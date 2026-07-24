import { listChannels } from '../channelsData.js';

function tieneUrlUtilizable(valor) {
    if (typeof valor !== 'string') return false;
    const texto = valor.trim();
    if (!texto) return false;
    if (texto.startsWith('http://') || texto.startsWith('https://')) return true;
    return false;
}

export function revisarSeñalesVacias(canalId) {
    const signals = listChannels?.[canalId]?.signals;
    if (signals) {
        const valoresUtilizables = Object.values(signals).filter((señal) => {
            if (Array.isArray(señal)) {
                return señal.some((item) => tieneUrlUtilizable(item));
            }
            if (typeof señal === 'string') {
                return tieneUrlUtilizable(señal);
            }
            return false;
        });

        const todasLasSeñalesVacias = valoresUtilizables.length === 0;
        if (todasLasSeñalesVacias) console.error(`${canalId} tiene todas sus signals vacías`);
        return todasLasSeñalesVacias;
    }
    return true;
}
