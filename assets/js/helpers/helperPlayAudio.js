/**
 * Reproduce un efecto de sonido desde el principio, aunque ya estuviera sonando.
 *
 * Rebobinar antes de `play()` evita que dos pulsaciones seguidas del mismo botón
 * se ignoren (un `<audio>` ya en curso no reinicia solo).
 *
 * @param {HTMLAudioElement} audio
 * @returns {void}
 */
export function playAudioSinDelay(audio) {
    audio.pause(); // https://stackoverflow.com/a/51573799
    audio.currentTime = 0;
    audio.play();
}
