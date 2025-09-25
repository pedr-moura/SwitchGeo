let model;
let view;
let controller;

function init() {
    try {
        model = new MappingModel();
        view = new MappingView(model);
        controller = new MappingController(model, view);

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