import { switchTab as utilsSwitchTab, toggleSidebar as utilsToggleSidebar } from '../utils/utils.js';

export function switchTab(tabId, event) {
    utilsSwitchTab(tabId, event);
    if (tabId === 'table-tab') {
        this.view.updateTable();
    }
}

export function toggleSidebar() {
    utilsToggleSidebar();
}

export function updateAllViews() {
    this.view.updateStats();
    this.view.updatePointList();
    this.view.updateTable();
    this.view.updateSelectionControls();
    this.view.updatePreviews();
}

export function toggleColorPalette() {
    const colorPalette = document.getElementById('color-palette-container');
    colorPalette.classList.toggle('hidden');
    colorPalette.classList.toggle('visible');
}