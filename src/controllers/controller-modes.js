import * as L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';

export function setMode(mode) {
    this.view.resetHandlers();
    this.model.setMode(mode);
    this.view.updateModeIndicator();
    this.setupModeHandlers();
    this.view.updateSelectionControls();
    this.view.updatePreviews();
}

export function setupModeHandlers() {
    Object.values(this.model.points).forEach(point => {
        if (!point.marker) return;

        if (this.model.currentMode === 'remove') {
            point.removeHandler = (e) => {
                this.deletePoint(point.id);
                L.DomEvent.stopPropagation(e);
            };
            point.marker.on('click', point.removeHandler);
        } else if (this.model.currentMode === 'connect' || this.model.currentMode === 'disconnect') {
            point.selectHandler = (e) => {
                this.togglePointSelection(point.id);
                L.DomEvent.stopPropagation(e);
            };
            point.marker.on('click', point.selectHandler);
        }
    });
}

export function toggleAddMode() {
    this.setMode(this.model.currentMode === 'add' ? 'normal' : 'add');
}

export function toggleRemoveMode() {
    this.setMode(this.model.currentMode === 'remove' ? 'normal' : 'remove');
}

export function toggleConnectMode() {
    const oldMode = this.model.currentMode;
    this.setMode(oldMode === 'connect' ? 'normal' : 'connect');
    console.log(this.model.currentMode);
    
    if (this.model.currentMode == 'disconnect') {
        this.deselectAll();
    }
}

export function toggleDisconnectMode() {
    const oldMode = this.model.currentMode;
    this.setMode(oldMode === 'disconnect' ? 'normal' : 'disconnect');
    console.log(this.model.currentMode);
    if (oldMode !== 'disconnect') {
        this.deselectAll();
    }
}