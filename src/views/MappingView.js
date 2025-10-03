import { initMap, renderPoint, renderConnection, updateMarkerIcon, removeMarker, removePolyline, toggleMapLayer, fitBounds, resetHandlers } from './view-map.js';
import { initUIElements, filterTable, updatePointList, updateTable, updateStats, updateSelectionControls, updatePreviews, updateModeIndicator, updatePointPopup, updateMarkerPosition, focusOnPoint } from './view-ui.js';
import { toggleGPS, onLocationFound, onLocationError } from './view-gps.js';
import { toggleClassesFromIdExact, addClassId, removeClassId } from './view-handlers.js';
import { enableDrawing, disableDrawing } from './view-drawing.js';

class MappingView {
    constructor(model) {
        this.model = model;
        this.map = null;
        this.previewLayer = null;
        this.mapLayers = null;
        this.locationMarker = null;
        this.accuracyCircle = null;
        this.isLocating = false;
        this.drawControl = null;

        initMap.call(this);
        initUIElements.call(this);

        this.map.on('locationfound', this.onLocationFound.bind(this));
        this.map.on('locationerror', this.onLocationError.bind(this));
    }

    renderPoint(point, isSelected = false) {
        renderPoint.call(this, point, isSelected);
    }

    renderConnection(conn) {
        renderConnection.call(this, conn);
    }

    updateMarkerIcon(id, isSelected) {
        updateMarkerIcon.call(this, id, isSelected);
    }

    removeMarker(id) {
        removeMarker.call(this, id);
    }

    removePolyline(conn) {
        removePolyline.call(this, conn);
    }

    toggleMapLayer() {
        toggleMapLayer.call(this);
    }

    toggleClassesFromIdExact(id, classA, classB) {
        toggleClassesFromIdExact(id, classA, classB);
    }

    addClassId(id, className) {
        addClassId(id, className);
    }

    removeClassId(id, className) {
        removeClassId(id, className);
    }

    updatePointList() {
        updatePointList.call(this);
    }

    updateTable() {
        updateTable.call(this);
    }

    updateStats() {
        updateStats.call(this);
    }

    updateSelectionControls() {
        updateSelectionControls.call(this);
    }

    updatePreviews() {
        updatePreviews.call(this);
    }

    updateModeIndicator() {
        updateModeIndicator.call(this);
    }

    updatePointPopup(id) {
        updatePointPopup.call(this, id);
    }

    updateMarkerPosition(id) {
        updateMarkerPosition.call(this, id);
    }

    focusOnPoint(id) {
        focusOnPoint.call(this, id);
    }

    fitBounds() {
        fitBounds.call(this);
    }

    resetHandlers() {
        resetHandlers.call(this);
    }

    filterTable() {
        filterTable.call(this);
    }

    toggleGPS() {
        toggleGPS.call(this);
    }

    onLocationFound(e) {
        onLocationFound.call(this, e);
    }

    onLocationError(e) {
        onLocationError.call(this, e);
    }

    enableDrawing() {
        enableDrawing.call(this);
    }

    disableDrawing() {
        disableDrawing.call(this);
    }
}

export default MappingView;