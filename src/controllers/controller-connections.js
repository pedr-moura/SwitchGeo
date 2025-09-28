import { showToast } from '../utils/utils.js';

export function deselectAll() {
    Object.values(this.model.points).forEach(point => {
        const id = point.id;
        if (this.model.selectedPoints.includes(id)) {
            this.view.updateMarkerIcon(id, false);
        }
    });
    this.model.clearSelection();
}

export function togglePointSelection(id) {
    console.log('selecionando: '+id+', modo: '+ this.model.currentMode)

    if (this.model.currentMode !== 'normal') {
    
    this.model.togglePointSelection(id);
    const isSelected = this.model.selectedPoints.includes(id);
    this.view.updateMarkerIcon(id, isSelected);
    this.updateAllViews();

    if (this.model.selectedPoints.length >= 2) {
        setTimeout(() => {
            if (this.model.currentMode === 'connect') {
                this.connectSelectedPoints();
            } else if (this.model.currentMode === 'disconnect') {
                this.disconnectSelectedPoints();
            }
        }, 600);
    }
    }
    
}

export function togglePointSelectionFromList(id, event) {
    event.stopPropagation();
    if (this.model.currentMode !== 'connect' && this.model.currentMode !== 'disconnect') {
        showToast('Entre no modo Conectar ou Desconectar', 'info');
        return;
    }
    this.togglePointSelection(id);
}

export function connectSelectedPoints() {
    let connectionsAdded = 0;
    for (let i = 0; i < this.model.selectedPoints.length - 1; i++) {
        for (let j = i + 1; j < this.model.selectedPoints.length; j++) {
            const from = this.model.selectedPoints[i];
            const to = this.model.selectedPoints[j];
            if (this.model.createConnection(from, to)) {
                const conn = this.model.connections.find(c => (c.from === from && c.to === to) || (c.from === to && c.to === from));
                this.view.renderConnection(conn);
                connectionsAdded++;
            }
        }
    }

    if (connectionsAdded > 0) {
        showToast(`${connectionsAdded} conexões criadas!`, 'success');
    } else {
        showToast('Já conectados', 'info');
    }

    this.deselectAll();
    this.model.setMode('normal');
    this.view.updateModeIndicator();
    this.updateAllViews();
}

export function disconnectSelectedPoints() {
    let connectionsRemoved = 0;
    for (let i = 0; i < this.model.selectedPoints.length - 1; i++) {
        for (let j = i + 1; j < this.model.selectedPoints.length; j++) {
            const from = this.model.selectedPoints[i];
            const to = this.model.selectedPoints[j];
            
            const connIndex = this.model.connections.findIndex(c =>
                (c.from === from && c.to === to) || (c.from === to && c.to === from)
            );
            
            if (connIndex !== -1) {
                const conn = this.model.connections[connIndex];
                this.view.removePolyline(conn);
                this.model.connections.splice(connIndex, 1);
                connectionsRemoved++;
            }
        }
    }

    if (connectionsRemoved > 0) {
        this.model.saveData();
        showToast(`${connectionsRemoved} conexões removidas!`, 'success');
    } else {
        showToast('Nenhuma conexão encontrada', 'info');
    }

    this.deselectAll();
    this.model.setMode('normal');
    this.view.updateModeIndicator();
    this.updateAllViews();
}