class MappingController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.initHandlers();
    }

    deselectAll() {
        Object.values(this.model.points).forEach(point => {
            const id = point.id;
            if (this.model.selectedPoints.includes(id)) {
                this.view.updateMarkerIcon(id, false);
            }
        });
        this.model.clearSelection();
    }

    initHandlers() {
        this.view.map.on('click', this.handleMapClick.bind(this));
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        document.getElementById('layerToggleBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.view.toggleMapLayer();
        });

        // Outros botões: add, remove, connect, disconnect, export, import, clear
        // Exemplo: document.getElementById('addBtn').addEventListener('click', this.toggleAddMode.bind(this));
        // Para import: document.getElementById('importInput').addEventListener('change', this.importData.bind(this));
    }

    handleMapClick(e) {
        if (!e || !e.latlng) return;
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        switch (this.model.currentMode) {
            case 'add':
                this.addPoint(lat, lng);
                break;
            case 'remove':
                showToast('Clique em um marcador para remover', 'info');
                break;
            case 'connect':
            case 'disconnect':
                showToast('Clique nos marcadores para selecionar', 'info');
                break;
            default:
                console.log(`Clicked at: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                break;
        }
    }

    addPoint(lat, lng) {
        const nameInput = document.getElementById('pointName');
        const descInput = document.getElementById('pointDesc');
        if (!nameInput || !descInput) return;

        const name = nameInput.value;
        const description = descInput.value;

        const point = this.model.addPoint(lat, lng, name, description);
        if (point) {
            this.view.renderPoint(point);
            nameInput.value = '';
            descInput.value = '';
            [nameInput, descInput].forEach(input => {
                input.style.borderColor = '#10B981';
                setTimeout(() => input.style.borderColor = '', 1500);
            });
            this.updateAllViews();
            showToast('Ponto adicionado!', 'success');
            this.model.setMode('normal');
            this.view.updateModeIndicator();
        }
    }

    deletePoint(id) {
        const point = this.model.points[id];
        if (point) {
            this.view.removeMarker(id);
            this.model.connections.forEach(conn => {
                if (conn.from === id || conn.to === id) {
                    this.view.removePolyline(conn);
                }
            });
            this.model.removePoint(id);
            this.updateAllViews();
            showToast('Ponto removido', 'info');
        }
    }

    editPoint(id) {
        const point = this.model.points[id];
        if (!point || !point.marker) return;

        const editContent = `
            <div style="font-family: Inter, sans-serif; min-width: 200px;">
                <input id="edit-name-${id}" type="text" value="${point.name}" style="width: 100%; padding: 8px; margin-bottom: 12px; border: 2px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-primary); font-family: inherit;">
                <textarea id="edit-desc-${id}" style="width: 100%; padding: 8px; margin-bottom: 12px; border: 2px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-primary); font-family: inherit; min-height: 60px;">${point.description}</textarea>
                <small style="font-size: 12px; color: #94A3B8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 12px;">
                    ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
                </small>
                <div style="display: flex; justify-content: flex-end; gap: 8px;">
                    <button style="padding: 6px 12px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border: none; border-radius: 6px; cursor: url('https://i.ibb.co/LXmQ0XGv/icons8-cursor-24-1-removebg-preview.png'), auto; font-weight: 600;" onclick="controller.saveEdit(${id})">Salvar</button>
                    <button style="padding: 6px 12px; background: var(--surface-light); color: var(--text-primary); border: none; border-radius: 6px; cursor: url('https://i.ibb.co/LXmQ0XGv/icons8-cursor-24-1-removebg-preview.png'), auto; font-weight: 600;" onclick="controller.cancelEdit(${id})">Cancelar</button>
                </div>
            </div>
        `;

        point.marker.getPopup().setContent(editContent);
    }

    saveEdit(id) {
        const point = this.model.points[id];
        if (!point) return;

        const nameInput = document.getElementById(`edit-name-${id}`);
        const descInput = document.getElementById(`edit-desc-${id}`);

        if (nameInput && descInput) {
            point.name = nameInput.value.trim() || `Ponto ${id}`;
            point.description = descInput.value.trim();
            this.model.saveData();
            this.view.updatePointPopup(id);
            this.view.updatePointList();
            this.view.updateTable();
            showToast('Ponto atualizado!', 'success');
        }
    }

    cancelEdit(id) {
        this.view.updatePointPopup(id);
    }

    togglePointSelection(id) {

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

    togglePointSelectionFromList(id, event) {
        event.stopPropagation();
        if (this.model.currentMode !== 'connect' && this.model.currentMode !== 'disconnect') {
            showToast('Entre no modo Conectar ou Desconectar', 'info');
            return;
        }
        this.togglePointSelection(id);
    }

    connectSelectedPoints() {
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

    disconnectSelectedPoints() {
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

    setMode(mode) {
        this.view.resetHandlers();
        this.model.setMode(mode);
        this.view.updateModeIndicator();
        this.setupModeHandlers();
        this.view.updateSelectionControls();
        this.view.updatePreviews();
    }

    setupModeHandlers() {
        Object.values(this.model.points).forEach(point => {
            if (!point.marker) return;

            if (this.model.currentMode === 'remove') {
                point.removeHandler = (e) => {
                    this.deletePoint(point.id);
                    L.DomEvent.stopPropagation(e);
                };
                point.marker.on('click', point.removeHandler);
            } else if (this.model.currentMode === 'connect' || this.model.currentMode === 'disconnect') {
                point.selectHandler = (e) => {
                    this.togglePointSelection(point.id);
                    L.DomEvent.stopPropagation(e);
                };
                point.marker.on('click', point.selectHandler);
            }
        });
    }

    toggleAddMode() {
        toggleSidebar()
        this.setMode(this.model.currentMode === 'add' ? 'normal' : 'add');
    }

    toggleRemoveMode() {
        toggleSidebar()
        this.setMode(this.model.currentMode === 'remove' ? 'normal' : 'remove');
    }

    toggleConnectMode() {
        toggleSidebar()
        const oldMode = this.model.currentMode;
        this.setMode(oldMode === 'connect' ? 'normal' : 'connect');
        console.log(this.model.currentMode);
        
        if (this.model.currentMode == 'disconnect') {
            this.deselectAll();
        }
    }

    toggleDisconnectMode() {
        toggleSidebar()
        const oldMode = this.model.currentMode;
        this.setMode(oldMode === 'disconnect' ? 'normal' : 'disconnect');
        console.log(this.model.currentMode);
        if (oldMode !== 'disconnect') {
            this.deselectAll();
        }
    }

    updatePointFromTable(cell) {
        try {
            const id = cell.dataset.id;
            const field = cell.dataset.field;
            const value = cell.textContent.trim();
            const point = this.model.points[id];
            if (!point) return;

            switch (field) {
                case 'name':
                    point.name = value || `Ponto ${id}`;
                    break;
                case 'lat':
                    const newLat = parseFloat(value);
                    if (!isNaN(newLat) && Math.abs(newLat) <= 90) {
                        point.lat = newLat;
                        this.view.updateMarkerPosition(id);
                    } else {
                        cell.textContent = point.lat.toFixed(2);
                        showToast('Latitude inválida', 'error');
                        return;
                    }
                    break;
                case 'lng':
                    const newLng = parseFloat(value);
                    if (!isNaN(newLng) && Math.abs(newLng) <= 180) {
                        point.lng = newLng;
                        this.view.updateMarkerPosition(id);
                    } else {
                        cell.textContent = point.lng.toFixed(2);
                        showToast('Longitude inválida', 'error');
                        return;
                    }
                    break;
                case 'description':
                    point.description = value;
                    break;
            }

            this.model.saveData();
            this.view.updatePointPopup(id);
            this.view.updatePointList();
            cell.style.background = 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), transparent)';
            setTimeout(() => cell.style.background = '', 1000);
            showToast('Ponto atualizado!', 'success');
        } catch (error) {
            console.error('Error updating point from table:', error);
            showToast('Erro ao atualizar', 'error');
        }
    }

    exportData() {
        try {
            let csv = 'ID,Nome,Latitude,Longitude,Descrição,Conexões\n';
            Object.values(this.model.points).forEach(point => {
                const pointConnections = this.model.connections
                    .filter(conn => conn.from === point.id || conn.to === point.id)
                    .map(conn => conn.from === point.id ? conn.to : conn.from)
                    .join(';');
                
                const escapedName = `"${point.name.replace(/"/g, '""')}"`;
                const escapedDesc = `"${point.description.replace(/"/g, '""')}"`;
                const escapedConns = `"${pointConnections}"`;
                
                csv += `"${point.id}",${escapedName},"${point.lat}","${point.lng}",${escapedDesc},${escapedConns}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `mapeamento_${timestamp}.csv`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('Exportado!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Erro ao exportar', 'error');
        }
    }

    importData(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            showToast('Importando...', 'info');

            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target.result;
                const lines = csv.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    showToast('CSV inválido', 'error');
                    return;
                }

                this.model.clearAllData();
                Object.values(this.model.points).forEach(point => this.view.removeMarker(point.id));
                this.model.connections.forEach(conn => this.view.removePolyline(conn));

                let importedPoints = 0;
                let importedConnections = 0;

                // Primeiro pass: adicionar pontos
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    if (values.length >= 5) {
                        const id = parseInt(values[0]);
                        const name = values[1];
                        const lat = parseFloat(values[2]);
                        const lng = parseFloat(values[3]);
                        const description = values[4];

                        if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                            const point = this.model.addPoint(lat, lng, name, description);
                            point.id = id; // Sobrescrever ID do CSV
                            this.model.pointIdCounter = Math.max(this.model.pointIdCounter, id + 1);
                            this.view.renderPoint(point);
                            importedPoints++;
                        }
                    }
                }

                // Segundo pass: adicionar conexões
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    if (values.length >= 6) {
                        const id = parseInt(values[0]);
                        const connectionIds = values[5].split(';').filter(connId => connId.trim()).map(Number);

                        connectionIds.forEach(connId => {
                            if (this.model.points[id] && this.model.points[connId]) {
                                if (this.model.createConnection(id, connId)) {
                                    const conn = this.model.connections.find(c => (c.from === id && c.to === connId) || (c.from === connId && c.to === id));
                                    this.view.renderConnection(conn);
                                    importedConnections++;
                                }
                            }
                        });
                    }
                }

                this.updateAllViews();
                this.view.fitBounds();
                showToast(`Importado! ${importedPoints} pontos, ${importedConnections} conexões`, 'success');
            };
            reader.readAsText(file, 'utf-8');
        } catch (error) {
            console.error('Error importing data:', error);
            showToast('Erro ao importar', 'error');
        }
        event.target.value = '';
    }

    clearAllData() {
        Object.values(this.model.points).forEach(point => this.view.removeMarker(point.id));
        this.model.connections.forEach(conn => this.view.removePolyline(conn));
        this.model.clearAllData();
        this.updateAllViews();
    }

    handleKeyboardShortcuts(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') return;

        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'a':
                    e.preventDefault();
                    this.toggleAddMode();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleRemoveMode();
                    break;
                case 'c':
                    e.preventDefault();
                    this.toggleConnectMode();
                    break;
                case 'x':
                    e.preventDefault();
                    this.toggleDisconnectMode();
                    break;
                case 's':
                    e.preventDefault();
                    this.exportData();
                    break;
                case 'm':
                    e.preventDefault();
                    this.view.toggleMapLayer();
                    break;
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.setMode('normal');
        }
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth > 768) {
            sidebar.classList.remove('open');
        }
        setTimeout(() => this.view.map.invalidateSize(), 300);
    }

    switchTab(tabId, event) {
        try {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

            document.getElementById(tabId).classList.add('active');
            if (event && event.target) event.target.classList.add('active');

            if (tabId === 'table-tab') {
                this.view.updateTable();
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('open');
    }

    updateAllViews() {
        this.view.updateStats();
        this.view.updatePointList();
        this.view.updateTable();
        this.view.updateSelectionControls();
        this.view.updatePreviews();
    }
}