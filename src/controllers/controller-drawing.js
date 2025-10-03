export function toggleDrawMode(shape) {
    const newMode = this.model.currentMode === `draw-${shape}` ? 'normal' : `draw-${shape}`;
    this.setMode(newMode);
}

export function startDrawing(shape) {
    this.view.map.dragging.disable();
    this.view.map.on('mousedown', this.onDrawStart.bind(this, shape));
}

export function stopDrawing() {
    this.view.map.dragging.enable();
    this.view.map.off('mousedown');
    this.view.map.off('mousemove');
    this.view.map.off('mouseup');
}

export function onDrawStart(shape, e) {
    this.view.map.on('mousemove', this.onDrawing.bind(this, shape, e.latlng));
    this.view.map.on('mouseup', this.onDrawEnd.bind(this, shape, e.latlng));
}

export function onDrawing(shape, startLatLng, e) {
    this.view.updateDrawing(shape, startLatLng, e.latlng);
}

export function onDrawEnd(shape, startLatLng, e) {
    this.view.clearTempDrawing();
    this.stopDrawing();
    const endLatLng = e.latlng;
    let drawing;

    if (shape === 'rectangle') {
        const bounds = [startLatLng, endLatLng];
        drawing = { type: 'rectangle', bounds };
    }

    if (drawing) {
        const newDrawing = this.model.addDrawing(drawing);
        this.view.renderDrawing(newDrawing);
    }
    this.setMode('normal');
}