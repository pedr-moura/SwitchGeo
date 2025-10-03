

export function toggleDrawMode() {
    this.setMode(this.model.currentMode === 'draw' ? 'normal' : 'draw');
}

export function initDrawing(map) {
    this.drawnItems = new L.FeatureGroup();
    map.addLayer(this.drawnItems);

    this.view.drawControl = new L.Control.Draw({
        edit: {
            featureGroup: this.drawnItems
        },
        draw: {
            polygon: true,
            polyline: true,
            rectangle: true,
            circle: true,
            marker: false
        }
    });

    map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        this.drawnItems.addLayer(layer);
        saveDrawing(this.drawnItems);
    });

    map.on(L.Draw.Event.EDITED, (event) => {
        saveDrawing(this.drawnItems);
    });

    map.on(L.Draw.Event.DELETED, (event) => {
        saveDrawing(this.drawnItems);
    });

    loadDrawing(map, this.drawnItems);
}

function saveDrawing(drawnItems) {
    const data = drawnItems.toGeoJSON();
    localStorage.setItem('drawnItems', JSON.stringify(data));
}

function loadDrawing(map, drawnItems) {
    const data = localStorage.getItem('drawnItems');
    if (data) {
        const geojson = JSON.parse(data);
        const layer = L.geoJSON(geojson);
        drawnItems.addLayer(layer);
    }
}
