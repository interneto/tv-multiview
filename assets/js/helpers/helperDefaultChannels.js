import { DEFAULT_CHANNELS_ARRAY, DEFAULT_CHANNEL_LIST_EXTRAS } from "../channelsData.js";

export function obtenerCanalesPredeterminados(isMobile) {
    return isMobile ? DEFAULT_CHANNELS_ARRAY : DEFAULT_CHANNELS_ARRAY.concat(DEFAULT_CHANNEL_LIST_EXTRAS);
}