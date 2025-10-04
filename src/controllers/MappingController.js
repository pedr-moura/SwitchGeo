import MappingModel from '../models/MappingModel.js';
import MappingView from '../views/MappingView.js';

import { initHandlers, handleMapClick, handleKeyboardShortcuts, handleResize } from './controller-handlers.js';
import { toggleAddMode, toggleRemoveMode, toggleConnectMode, toggleDisconnectMode, setMode, setupModeHandlers } from './controller-modes.js';
import { exportData, importData, updatePointFromTable, clearAllData } from './controller-data.js';
import { addPoint, deletePoint, editPoint, saveEdit, cancelEdit, editNewPoint } from './controller-points.js';
import { connectSelectedPoints, disconnectSelectedPoints, deselectAll, togglePointSelection, togglePointSelectionFromList } from './controller-connections.js';
import { switchTab, toggleSidebar, updateAllViews, toggleColorPalette } from './controller-ui.js';
import { toggleGPS } from './controller-gps.js';
import { toggleDrawMode, startDrawing, stopDrawing, onDrawStart, onDrawing, onDrawEnd } from './controller-drawing.js';

class MappingController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentColor = '#ff7800'; // Default color
        this.tempPolyline = null;
        this.tempLayer = null;
        this.initHandlers();
    }

    setCurrentColor(color) {
        this.currentColor = color;
        this.toggleDrawMode('rectangle');
        // Optional: update UI to show selected color
    }

    deselectAll() {
        deselectAll.call(this);
    }

    editNewPoint() {
        editNewPoint.call(this);
    }

    handleMapClick(e) {
        handleMapClick.call(this, e);
    }

    addPoint(lat, lng) {
        addPoint.call(this, lat, lng);
    }

    deletePoint(id) {
        deletePoint.call(this, id);
    }

    editPoint(id) {
        editPoint.call(this, id);
    }

    saveEdit(id) {
        saveEdit.call(this, id);
    }

    cancelEdit(id) {
        cancelEdit.call(this, id);
    }

    togglePointSelection(id) {
        togglePointSelection.call(this, id);
    }

    togglePointSelectionFromList(id, event) {
        togglePointSelectionFromList.call(this, id, event);
    }

    connectSelectedPoints() {
        connectSelectedPoints.call(this);
    }

    disconnectSelectedPoints() {
        disconnectSelectedPoints.call(this);
    }

    setMode(mode) {
        setMode.call(this, mode);
    }

    setupModeHandlers() {
        setupModeHandlers.call(this);
    }

    toggleAddMode() {
        toggleAddMode.call(this);
    }

    toggleRemoveMode() {
        toggleRemoveMode.call(this);
    }

    toggleConnectMode() {
        toggleConnectMode.call(this);
    }

    toggleDisconnectMode() {
        toggleDisconnectMode.call(this);
    }

    toggleDrawMode(shape) {
        toggleDrawMode.call(this, shape);
    }

    startDrawing(shape) {
        startDrawing.call(this, shape);
    }

    stopDrawing() {
        stopDrawing.call(this);
    }

    onDrawStart(shape, e) {
        onDrawStart.call(this, shape, e);
    }

    onDrawing(shape, startLatLng, e) {
        onDrawing.call(this, shape, startLatLng, e);
    }

    onDrawEnd(shape, startLatLng, e) {
        onDrawEnd.call(this, shape, startLatLng, e);
    }

    updatePointFromTable(cell) {
        updatePointFromTable.call(this, cell);
    }

    exportData() {
        exportData.call(this);
    }

    importData(event) {
        importData.call(this, event);
    }

    clearAllData() {
        clearAllData.call(this);
    }

    handleKeyboardShortcuts(e) {
        handleKeyboardShortcuts.call(this, e);
    }

    handleResize() {
        handleResize.call(this);
    }

    switchTab(tabId, event) {
        switchTab(tabId, event);
    }

    toggleSidebar() {
        toggleSidebar();
    }

    updateAllViews() {
        updateAllViews.call(this);
    }

    toggleColorPalette() {
        toggleColorPalette.call(this);
    }

    toggleGPS() {
        toggleGPS.call(this);
    }

    initHandlers() {
        initHandlers.call(this);
    }
}

export default MappingController;