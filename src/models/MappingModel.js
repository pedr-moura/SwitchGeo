class MappingModel {
    constructor() {
        this.points = {};
        this.connections = [];
        this.drawings = [];
        this.selectedPoints = [];
        this.currentMode = 'normal';
        this.pointIdCounter = 1;
        this.drawingIdCounter = 1;
        this.loadData();
    }

    addPoint(lat, lng, name, description) {
        try {
            const point = {
                id: this.pointIdCounter++,
                name: name.trim() || `Ponto ${this.pointIdCounter - 1}`,
                description: description.trim() || '',
                lat,
                lng,
                marker: null, // Será setado pela View
                popupContent: null,
                selectHandler: null,
                removeHandler: null
            };
            this.points[point.id] = point;
            this.saveData();
            return point;
        } catch (error) {
            console.error('Error adding point:', error);
            showToast('Erro ao adicionar ponto', 'error');
        }
    }

    addDrawing(drawing) {
        try {
            drawing.id = this.drawingIdCounter++;
            this.drawings.push(drawing);
            this.saveData();
            return drawing;
        } catch (error) {
            console.error('Error adding drawing:', error);
        }
    }

    removePoint(id) {
        try {
            const point = this.points[id];
            if (!point) return;

            // Remover conexões relacionadas
            this.connections = this.connections.filter(conn => conn.from !== id && conn.to !== id);

            // Remover da seleção
            const index = this.selectedPoints.indexOf(id);
            if (index > -1) this.selectedPoints.splice(index, 1);

            delete this.points[id];
            this.saveData();
        } catch (error) {
            console.error('Error removing point:', error);
            showToast('Erro ao remover ponto', 'error');
        }
    }

    togglePointSelection(id) {
        const index = this.selectedPoints.indexOf(id);
        if (index > -1) {
            this.selectedPoints.splice(index, 1);
        } else {
            this.selectedPoints.push(id);
        }
    }

    clearSelection() {
        this.selectedPoints = [];
    }

    createConnection(fromId, toId) {
        try {
            if (!this.points[fromId] || !this.points[toId]) return null;

            const exists = this.connections.some(conn =>
                (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId)
            );

            if (!exists) {
                const newConnection = { from: fromId, to: toId, polyline: null };
                this.connections.push(newConnection);
                this.saveData();
                return newConnection;
            }
            return null;
        } catch (error) {
            console.error('Error creating connection:', error);
            return null;
        }
    }

    removeConnection(fromId, toId) {
        try {
            const initialLength = this.connections.length;
            this.connections = this.connections.filter(conn =>
                !((conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId))
            );
            if (this.connections.length < initialLength) {
                this.saveData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing connection:', error);
            return false;
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        if (mode !== 'connect' && mode !== 'disconnect') {
            this.clearSelection();
        }
    }

    saveData() {
        try {
            const serializablePoints = Object.fromEntries(
                Object.entries(this.points).map(([id, p]) => [id, {
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    lat: p.lat,
                    lng: p.lng
                }])
            );
            const serializableConnections = this.connections.map(c => ({ from: c.from, to: c.to }));
            const serializableDrawings = this.drawings.map(d => {
                const drawing = { ...d };
                delete drawing.layer;
                return drawing;
            });

            localStorage.setItem('mapping_points', JSON.stringify(serializablePoints));
            localStorage.setItem('mapping_connections', JSON.stringify(serializableConnections));
            localStorage.setItem('mapping_drawings', JSON.stringify(serializableDrawings));
            localStorage.setItem('mapping_pointIdCounter', this.pointIdCounter.toString());
            localStorage.setItem('mapping_drawingIdCounter', this.drawingIdCounter.toString());
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadData() {
        try {
            const savedPoints = JSON.parse(localStorage.getItem('mapping_points'));
            const savedConnections = JSON.parse(localStorage.getItem('mapping_connections'));
            const savedDrawings = JSON.parse(localStorage.getItem('mapping_drawings'));
            const savedPointCounter = localStorage.getItem('mapping_pointIdCounter');
            const savedDrawingCounter = localStorage.getItem('mapping_drawingIdCounter');

            if (savedPoints) {
                this.points = Object.fromEntries(
                    Object.entries(savedPoints).map(([id, p]) => [id, {
                        ...p,
                        marker: null,
                        popupContent: null,
                        selectHandler: null,
                        removeHandler: null
                    }])
                );
            }
            if (savedConnections) {
                this.connections = savedConnections.map(c => ({ ...c, polyline: null }));
            }
            if (savedDrawings) {
                this.drawings = savedDrawings.map(d => ({ ...d, layer: null }));
            }
            if (savedPointCounter) {
                this.pointIdCounter = parseInt(savedPointCounter, 10);
            }
            if (savedDrawingCounter) {
                this.drawingIdCounter = parseInt(savedDrawingCounter, 10);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    clearAllData() {
        this.points = {};
        this.connections = [];
        this.drawings = [];
        this.selectedPoints = [];
        this.pointIdCounter = 1;
        this.drawingIdCounter = 1;
        this.saveData();
    }
}

export default MappingModel;