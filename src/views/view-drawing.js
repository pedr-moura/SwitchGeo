let tempLayer = null;

export function updateDrawing(shape, startLatLng, endLatLng) {
    if (tempLayer) {
        this.map.removeLayer(tempLayer);
    }

    if (shape === 'rectangle') {
        const bounds = [startLatLng, endLatLng];
        tempLayer = L.rectangle(bounds, { color: "#ff7800", weight: 1 }).addTo(this.map);
    }
}

export function renderDrawing(drawing) {
    let layer;
    if (drawing.type === 'rectangle') {
        layer = L.rectangle(drawing.bounds, { color: "#ff7800", weight: 1 });
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
