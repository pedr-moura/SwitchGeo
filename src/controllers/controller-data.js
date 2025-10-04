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
        let csv = 'ID,Type,Name,Data,Connections,Color\n';

        // Export Points
        Object.values(this.model.points).forEach(point => {
            const pointConnections = this.model.connections
                .filter(conn => conn.from === point.id || conn.to === point.id)
                .map(conn => conn.from === point.id ? conn.to : conn.from)
                .join(';');
            
            const escapedName = `"${point.name.replace(/"/g, '""')}"`;
            const data = `"${point.lat},${point.lng},${point.description.replace(/"/g, '""')}"`;
            const escapedConns = `"${pointConnections}"`;
            
            csv += `"${point.id}","Point",${escapedName},${data},${escapedConns},""\n`;
        });

        // Export Drawings
        this.model.drawings.forEach(drawing => {
            let data = '';
            if (drawing.type === 'rectangle') {
                data = `"${drawing.bounds[0][0]},${drawing.bounds[0][1]},${drawing.bounds[1][0]},${drawing.bounds[1][1]}"`;
            }
            csv += `"${drawing.id}","${drawing.type}","",${data},"",${drawing.color}\n`;
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
            this.model.drawings.forEach(drawing => this.view.removeDrawing(drawing));

            let importedPoints = 0;
            let importedDrawings = 0;
            let importedConnections = 0;

            // Primeiro pass: adicionar pontos e desenhos
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                const id = parseInt(values[0]);
                const type = values[1];
                const name = values[2];
                const data = values[3].split(',');
                const color = values[5];

                if (type === 'Point') {
                    const lat = parseFloat(data[0]);
                    const lng = parseFloat(data[1]);
                    const description = data.slice(2).join(',');

                    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                        const point = this.model.addPoint(lat, lng, name, description);
                        point.id = id; // Sobrescrever ID do CSV
                        this.model.pointIdCounter = Math.max(this.model.pointIdCounter, id + 1);
                        this.view.renderPoint(point);
                        importedPoints++;
                    }
                } else if (type === 'rectangle') {
                    const bounds = [[parseFloat(data[0]), parseFloat(data[1])], [parseFloat(data[2]), parseFloat(data[3])]];
                    const drawing = this.model.addDrawing({ type: 'rectangle', bounds, color });
                    drawing.id = id;
                    this.model.drawingIdCounter = Math.max(this.model.drawingIdCounter, id + 1);
                    this.view.renderDrawing(drawing);
                    importedDrawings++;
                }
            }

            // Segundo pass: adicionar conexões
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                if (values[1] === 'Point') {
                    const id = parseInt(values[0]);
                    const connectionIds = values[4].split(';').filter(connId => connId.trim()).map(Number);

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
            showToast(`Importado! ${importedPoints} pontos, ${importedDrawings} desenhos, ${importedConnections} conexões`, 'success');
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