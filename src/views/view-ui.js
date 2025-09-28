import { showToast } from '../utils/utils.js';
import { createPopupContent } from '../utils/utils.js';

export function initUIElements() {
    // Cache elements
    this.pointList = document.getElementById('pointList');
    this.tableBody = document.getElementById('tableBody');
    this.modeIndicator = document.getElementById('modeIndicator');
    this.selectionControls = document.getElementById('selectionControls');
    this.selectionCount = document.getElementById('selectionCount');
    this.pointCountEl = document.getElementById('point-count');
    this.connectionCountEl = document.getElementById('connection-count');
    this.tableFilter = document.getElementById('tableFilter');
    if (this.tableFilter) {
        this.tableFilter.addEventListener('input', this.filterTable.bind(this));
    }
}

export function filterTable() {
    try {
        const filterValue = this.tableFilter.value.toLowerCase().trim();
        const rows = this.tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            if (row.classList.contains('empty-state')) return; // Ignora mensagem de estado vazio

            const cells = row.querySelectorAll('td');
            let matches = false;

            cells.forEach(cell => {
                const text = cell.textContent.toLowerCase();
                if (text.includes(filterValue)) {
                    matches = true;
                }
            });

            row.style.display = matches || !filterValue ? '' : 'none';
        });
    } catch (error) {
        console.error('Error filtering table:', error);
    }
}

export function updatePointList() {
    try {
        if (!this.pointList) return;

        if (Object.keys(this.model.points).length === 0) {
            this.pointList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-pin"></i>
                    <h3>Nenhum ponto</h3>
                    <p>Adicione pontos</p>
                </div>
            `;
            return;
        }

        this.pointList.innerHTML = '';
        Object.values(this.model.points).forEach(point => {
            const isSelected = this.model.selectedPoints.includes(point.id);
            const div = document.createElement('div');
            div.className = 'point-item' + (isSelected ? ' selected' : '');
            div.innerHTML = `
                <div class="point-checkbox ${isSelected ? 'checked' : ''}" onclick="controller.togglePointSelectionFromList(${point.id}, event)">
                    ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="point-info">
                    <div class="point-name">${point.name}</div>
                    <div class="point-coords">${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</div>
                    ${point.description ? `<div class="point-desc">${point.description}</div>` : ''}
                </div>
            `;
            div.onclick = (e) => {
                if (!e.target.closest('.point-checkbox')) {
                    this.focusOnPoint(point.id);
                }
            };
            this.pointList.appendChild(div);
        });
    } catch (error) {
        console.error('Error updating point list:', error);
    }
}

export function updateTable() {
    try {
        if (!this.tableBody) return;

        if (Object.keys(this.model.points).length === 0) {
            this.tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="4">
                        <div class="empty-state">
                            <i class="fas fa-table"></i>
                            <h3>Nenhum dado</h3>
                            <p>Adicione pontos</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = '';
        Object.values(this.model.points).forEach(point => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td contenteditable="false" data-field="name" data-id="${point.id}">${point.name}</td>
                <td contenteditable="false" data-field="description" data-id="${point.id}">${point.description || ''}</td>
            `;
            row.onclick = () => this.focusOnPoint(point.id);
            this.tableBody.appendChild(row);

            row.querySelectorAll('[contenteditable]').forEach(cell => {
                cell.addEventListener('focus', () => {
                    const field = cell.dataset.field;
                    if (field === 'lat' || field === 'lng') {
                        cell.textContent = point[field].toFixed(15);
                    }
                });
                cell.addEventListener('blur', () => {
                    controller.updatePointFromTable(cell);
                    const field = cell.dataset.field;
                    if (field === 'lat' || field === 'lng') {
                        const value = parseFloat(cell.textContent);
                        if (!isNaN(value)) cell.textContent = value.toFixed(2);
                    }
                });
                cell.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        cell.blur();
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error updating table:', error);
    }

    this.filterTable();
}

export function updateStats() {
    try {
        const pointCount = Object.keys(this.model.points).length;
        const connectionCount = this.model.connections.length;

        if (this.pointCountEl) {
            this.pointCountEl.textContent = pointCount;
            this.pointCountEl.style.transform = 'scale(1.15)';
            setTimeout(() => this.pointCountEl.style.transform = 'scale(1)', 300);
        }

        if (this.connectionCountEl) {
            this.connectionCountEl.textContent = connectionCount;
            this.connectionCountEl.style.transform = 'scale(1.15)';
            setTimeout(() => this.connectionCountEl.style.transform = 'scale(1)', 300);
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

export function updateSelectionControls() {
    if (!this.selectionControls || !this.selectionCount) return;

    if (this.model.selectedPoints.length > 0 && (this.model.currentMode === 'connect' || this.model.currentMode === 'disconnect')) {
        this.selectionControls.style.display = 'block';
        this.selectionCount.textContent = `${this.model.selectedPoints.length} selecionados`;
    } else {
        this.selectionControls.style.display = 'none';
    }
}

export function updatePreviews() {
    if (!this.previewLayer) return;
    this.previewLayer.clearLayers();

    if (this.model.selectedPoints.length < 2) return;

    for (let i = 0; i < this.model.selectedPoints.length - 1; i++) {
        for (let j = i + 1; j < this.model.selectedPoints.length; j++) {
            const fromId = this.model.selectedPoints[i];
            const toId = this.model.selectedPoints[j];
            const fromPoint = this.model.points[fromId];
            const toPoint = this.model.points[toId];

            if (!fromPoint || !toPoint) continue;

            const exists = this.model.connections.some(conn =>
                (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId)
            );

            if ((this.model.currentMode === 'connect' && exists) || (this.model.currentMode === 'disconnect' && !exists)) continue;

            let style;
            if (this.model.currentMode === 'connect') {
                style = {
                    color: 'var(--success)', // Verde para conectar
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '5, 5'
                };
            } else if (this.model.currentMode === 'disconnect') {
                style = {
                    color: 'var(--danger)', // Vermelho para desconectar
                    weight: 5,
                    opacity: 0.8,
                    dashArray: 'none'
                };
            } else if (this.model.currentMode === 'normal') {
                style = {
                    color: 'none',
                    weight: 5,
                    opacity: 0.2,
                    dashArray: 'none'
                };
            }

            L.polyline([[fromPoint.lat, fromPoint.lng], [toPoint.lat, toPoint.lng]], style).addTo(this.previewLayer);
        }
    }
}

export function updateModeIndicator() {
    if (!this.modeIndicator) return;

    let html = '';
    let className = 'mode-indicator';
    let cursor = '';

    switch (this.model.currentMode) {
        case 'add':
            html = '<i class="fas fa-plus"></i>';
            className += ' active';
            showToast('Clique no mapa para adicionar', 'info');
            break;
        case 'remove':
            html = '<i class="fas fa-trash-alt"></i>';
            className += ' active';
            cursor = 'not-allowed';
            showToast('Clique em marcador para remover', 'info');
            break;
        case 'connect':
            html = '<i class="fas fa-link"></i>';
            className += ' active';
            showToast('Selecione marcadores para conectar', 'info', 5000);
            break;
        case 'disconnect':
            html = '<i class="fas fa-unlink"></i>';
            className += ' active';
            cursor = 'no-drop';
            showToast('Selecione marcadores para desconectar', 'info', 5000);
            break;
        default:
            html = '<i class="fas fa-cube"></i>';
            cursor = '';
            break;
    }

    this.modeIndicator.innerHTML = html;
    this.modeIndicator.className = className;
    this.map.getContainer().style.cursor = cursor;
}

export function updatePointPopup(id) {
    const point = this.model.points[id];
    if (!point || !point.marker) return;

    point.popupContent = createPopupContent(point);
    point.marker.bindPopup(point.popupContent, { maxWidth: 300, className: 'custom-popup' });

    const popup = point.marker.getPopup();
    if (popup && popup.isOpen()) {
        popup.setContent(point.popupContent);
    }
}

export function updateMarkerPosition(id) {
    const point = this.model.points[id];
    if (!point || !point.marker) return;

    point.marker.setLatLng([point.lat, point.lng]);

    this.model.connections.forEach(conn => {
        if (conn.from === id || conn.to === id) {
            const fromPoint = this.model.points[conn.from];
            const toPoint = this.model.points[conn.to];
            if (fromPoint && toPoint && conn.polyline) {
                conn.polyline.setLatLngs([[fromPoint.lat, fromPoint.lng], [toPoint.lat, toPoint.lng]]);
            }
        }
    });

    this.updatePointPopup(id);
}

export function focusOnPoint(id) {
    const point = this.model.points[id];
    if (!point) return;

    this.map.flyTo([point.lat, point.lng], 16, { duration: 1.5 });
    setTimeout(() => {
        if (point.marker) point.marker.openPopup();
    }, 1000);
}