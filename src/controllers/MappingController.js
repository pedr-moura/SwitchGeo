import MappingModel from '../models/MappingModel.js';
import MappingView from '../views/MappingView.js';

import { initHandlers, handleMapClick, handleKeyboardShortcuts, handleResize } from './controller-handlers.js';
import { toggleAddMode, toggleRemoveMode, toggleConnectMode, toggleDisconnectMode, setMode, setupModeHandlers } from './controller-modes.js';
import { exportData, importData, updatePointFromTable, clearAllData } from './controller-data.js';
import { addPoint, deletePoint, editPoint, saveEdit, cancelEdit, editNewPoint } from './controller-points.js';
import { connectSelectedPoints, disconnectSelectedPoints, deselectAll, togglePointSelection, togglePointSelectionFromList } from './controller-connections.js';
import { switchTab, toggleSidebar, updateAllViews } from './controller-ui.js';
import { toggleGPS } from './controller-gps.js';
import { toggleDrawMode, initDrawing } from './controller-drawing.js';

class MappingController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.initHandlers();
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

    toggleDrawMode() {
        toggleDrawMode.call(this);
    }

    initDrawing() {
        initDrawing.call(this, this.view.map);
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

    toggleGPS() {
        toggleGPS.call(this);
    }

    initHandlers() {
        initHandlers.call(this);
    }
}

export default MappingController;