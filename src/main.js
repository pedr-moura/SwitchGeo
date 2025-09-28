import MappingModel from './models/MappingModel.js';
import MappingView from './views/MappingView.js';
import MappingController from './controllers/MappingController.js';

import { showToast } from './utils/utils.js';

let model;
let view;
let controller;
let maxId;

function init() {
    try {
        model = new MappingModel();
        view = new MappingView(model);
        controller = new MappingController(model, view);

        window.toggleAddMode = controller.toggleAddMode.bind(controller);
        window.toggleRemoveMode = controller.toggleRemoveMode.bind(controller);
        window.toggleConnectMode = controller.toggleConnectMode.bind(controller);
        window.toggleDisconnectMode = controller.toggleDisconnectMode.bind(controller);
        window.exportData = controller.exportData.bind(controller);
        window.importData = controller.importData.bind(controller);
        window.switchTab = controller.switchTab.bind(controller);
        window.toggleSidebar = controller.toggleSidebar.bind(controller);
        window.clearSelection = () => {
            controller.model.clearSelection();
            controller.model.selectedPoints.forEach(id => {
                controller.view.updateMarkerIcon(id, false);
            });
            controller.updateAllViews();
        };

        // Renderizar pontos e conexões carregados
        Object.values(model.points).forEach(point => {
            view.renderPoint(point);
        });
        model.connections.forEach(conn => {
            view.renderConnection(conn);
        });

        if (Object.keys(model.points).length > 0) {
            view.fitBounds();
        }

        controller.updateAllViews();
        showToast('Sistema inicializado!', 'success');

        window.editPoint = controller.editPoint.bind(controller);
        window.deletePoint = controller.deletePoint.bind(controller);
        window.saveEdit = controller.saveEdit.bind(controller);
        window.cancelEdit = controller.cancelEdit.bind(controller);
        window.controller = controller; // Para togglePointSelectionFromList
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showToast('Erro ao inicializar', 'error');
    }
}

document.addEventListener('DOMContentLoaded', init);