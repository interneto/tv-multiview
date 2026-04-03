import { getVisibilityLabel } from '../i18n.js';

export function setCheckboxState(checkbox, status, item, visible = true) {
    checkbox.checked = visible;
    status.textContent = getVisibilityLabel(visible);
    localStorage.setItem(item, visible ? 'show' : 'hide');
}
