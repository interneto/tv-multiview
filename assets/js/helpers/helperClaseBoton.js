import { CSS_CLASS_PRIMARY_BUTTON, CSS_CLASS_SECONDARY_BUTTON } from "../constants/index.js";

export function ajustarClaseBotonCanal(canal, esActivo) {
    let buttons = document.querySelectorAll(`button[data-canal="${canal}"]`);
    buttons.forEach(boton => {
        esActivo ? boton.classList.replace(CSS_CLASS_SECONDARY_BUTTON, CSS_CLASS_PRIMARY_BUTTON) : boton.classList.replace(CSS_CLASS_PRIMARY_BUTTON, CSS_CLASS_SECONDARY_BUTTON);
    });
}