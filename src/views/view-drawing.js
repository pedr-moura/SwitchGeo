let tempLayer = null;

export function updateDrawing(options) {
    if (tempLayer) {
        this.map.removeLayer(tempLayer);
    }

    if (options.shape === 'rectangle') {
        tempLayer = L.rectangle(options.bounds, { color: "#ff7800", weight: 1 }).addTo(this.map);
    }
}

export function renderDrawing(drawing) {
    let layer;
    if (drawing.type === 'rectangle') {
        layer = L.rectangle(drawing.bounds, { color: drawing.color || "#ff7800", weight: 1 });
    }

    if (layer) {
        drawing.layer = layer;
        layer.addTo(this.map);
    }
}

export function removeDrawing(drawing) {
    if (drawing && drawing.layer) {
        this.map.removeLayer(drawing.layer);
    }
}

export function clearTempDrawing() {
    if (tempLayer) {
        this.map.removeLayer(tempLayer);
        tempLayer = null;
    }
}