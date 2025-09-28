import { showToast, parseCSVLine } from '../utils/utils.js';

export function updatePointFromTable(cell) {
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

export function exportData() {
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

export function importData(event) {
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

export function clearAllData() {
    Object.values(this.model.points).forEach(point => this.view.removeMarker(point.id));
    this.model.connections.forEach(conn => this.view.removePolyline(conn));
    this.model.clearAllData();
    this.updateAllViews();
}