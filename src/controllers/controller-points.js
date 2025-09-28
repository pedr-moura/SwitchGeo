import { showToast } from '../utils/utils.js';

export function addPoint(lat, lng) {
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
        this.editNewPoint()
    }
}

export function deletePoint(id) {
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

export function editPoint(id) {
    const point = this.model.points[id];
    if (!point || !point.marker) return;

    const editContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <input id="edit-name-${id}" type="text" value="${point.name}" style="width: 100%; padding: 8px; margin-bottom: 12px; border: 2px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-primary); font-family: inherit;">
            <textarea maxlength="120" id="edit-desc-${id}" style="width: 100%; padding: 8px; margin-bottom: 12px; border: 2px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-primary); font-family: inherit; min-height: 60px;">${point.description}</textarea>
            <small style="font-size: 12px; color: #94A3B8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 12px;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
            </small>
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button style="padding: 6px 12px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border: none; border-radius: 6px; cursor: default; font-weight: 600;" onclick="controller.saveEdit(${id})">Salvar</button>
                <button style="padding: 6px 12px; background: var(--surface-light); color: var(--text-primary); border: none; border-radius: 6px; cursor: default; font-weight: 600;" onclick="controller.cancelEdit(${id})">Cancelar</button>
            </div>
        </div>
    `;

    setTimeout( function () {
        point.marker.getPopup().setContent(editContent);
    }, 0);
}

export function saveEdit(id) {
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
    this.view.map.closePopup();
}

export function cancelEdit(id) {
    this.view.updatePointPopup(id);
    this.view.map.closePopup();
}

export function editNewPoint(){
    const points = this.model.points;
    const keys = Object.keys(points);           // ['1', '12', '13', ..., '30']
    const lastKey = keys[keys.length - 1];      // pega a última chave
    const maxPoint = points[lastKey];           // ponto com maior ID
    const maxId = maxPoint.id;

    setTimeout( () => {
        this.editPoint(maxId)
        this.model.points[maxId].marker.openPopup();
    }, 0);
}