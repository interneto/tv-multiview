import { listChannels } from '../channelsData.js';
import { revisarSeñalesVacias, mostrarToast, readStoredObject } from './index.js';
import { buildPreferredSignalUnavailableMessage } from '../i18n.js';

export function borraPreferenciaSeñalInvalida() {
    let lsPreferenciasSeñalCanales = readStoredObject('preferencia-señal-canales');
    if (Object.keys(lsPreferenciasSeñalCanales).length !== 0) {
        for (const idCanalGuardado in lsPreferenciasSeñalCanales) {
            let tipoSeñalGuardada = Object.keys(
                lsPreferenciasSeñalCanales[idCanalGuardado],
            )[0].toString();
            let valorIndexArraySeñal = Number(
                Object.values(lsPreferenciasSeñalCanales[idCanalGuardado]),
            );

            if (!revisarSeñalesVacias(idCanalGuardado)) {
                // si no estan vacias
                if (tipoSeñalGuardada === 'iframe_url' || tipoSeñalGuardada === 'm3u8_url') {
                    if (
                        listChannels?.[idCanalGuardado]?.signals?.[tipoSeñalGuardada][
                            valorIndexArraySeñal
                        ] === undefined
                    ) {
                        mostrarToast(
                            buildPreferredSignalUnavailableMessage(
                                idCanalGuardado,
                                `${tipoSeñalGuardada}[${valorIndexArraySeñal}]`,
                            ),
                            'warning',
                            false,
                        );
                        delete lsPreferenciasSeñalCanales[idCanalGuardado];
                        localStorage.setItem(
                            'preferencia-señal-canales',
                            JSON.stringify(lsPreferenciasSeñalCanales),
                        );
                    }
                } else {
                    if (listChannels?.[idCanalGuardado]?.signals?.[tipoSeñalGuardada] === '') {
                        mostrarToast(
                            buildPreferredSignalUnavailableMessage(
                                idCanalGuardado,
                                `${tipoSeñalGuardada}[${valorIndexArraySeñal}]`,
                            ),
                            'warning',
                            false,
                        );
                        delete lsPreferenciasSeñalCanales[idCanalGuardado];
                        localStorage.setItem(
                            'preferencia-señal-canales',
                            JSON.stringify(lsPreferenciasSeñalCanales),
                        );
                    }
                }
            }
        }
    }
}
