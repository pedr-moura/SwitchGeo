class MappingView {
    constructor(model) {
        this.model = model;
        this.map = null;
        this.previewLayer = null;
        this.mapLayers = null;
        this.locationMarker = null; // Marcador de GPS
        this.accuracyCircle = null; // Círculo de precisão
        this.isLocating = false; // Flag para toggle
        this.initMap();
        this.initUIElements();
    }

    initMap() {
        if (!document.getElementById('map')) {
            throw new Error('Map container not found');
        }

        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: true
        }).setView([-23.5505, -46.6333], 4);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
        L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(this.map);

        const satelliteLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: 'Map data &copy; <a href="https://www.google.com/maps">Google</a>',
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20
        });

        const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        });

        satelliteLayer.addTo(this.map);

        this.mapLayers = {
            satellite: satelliteLayer,
            dark: darkLayer,
            current: 'satellite'
        };

        this.previewLayer = L.layerGroup().addTo(this.map);

        // Adicionar listeners para eventos de localização
        this.map.on('locationfound', this.onLocationFound.bind(this));
        this.map.on('locationerror', this.onLocationError.bind(this));
    }

    initUIElements() {
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

    filterTable() {
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

    renderPoint(point, isSelected = false) {
        try {
            point.popupContent = createPopupContent(point);
            const icon = createMarkerIcon(point.id, isSelected);
            point.marker = L.marker([point.lat, point.lng], { icon })
                .bindPopup(point.popupContent, { maxWidth: 300, className: 'custom-popup' })
                .addTo(this.map);
        } catch (error) {
            console.error('Error rendering point:', error);
        }
    }

    renderConnection(conn) {
        try {
            const fromPoint = this.model.points[conn.from];
            const toPoint = this.model.points[conn.to];
            if (!fromPoint || !toPoint) return;

            conn.polyline = L.polyline([
                [fromPoint.lat, fromPoint.lng],
                [toPoint.lat, toPoint.lng]
            ], {
                color: '#3B82F6',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 12',
                className: 'connection-line'
            }).addTo(this.map);

            conn.polyline.on('mouseover', function() {
                this.setStyle({ weight: 6, opacity: 1, color: '#60A5FA' });
            });

            conn.polyline.on('mouseout', function() {
                this.setStyle({ weight: 4, opacity: 0.8, color: '#3B82F6' });
            });
        } catch (error) {
            console.error('Error rendering connection:', error);
        }
    }

    updateMarkerIcon(id, isSelected) {
        const point = this.model.points[id];
        if (point && point.marker) {
            point.marker.setIcon(createMarkerIcon(id, isSelected));
        }
    }

    removeMarker(id) {
        const point = this.model.points[id];
        if (point && point.marker) {
            this.map.removeLayer(point.marker);
        }
    }

    removePolyline(conn) {
        if (conn.polyline) {
            this.map.removeLayer(conn.polyline);
        }
    }

    toggleMapLayer() {
        try {
            if (this.mapLayers.current === 'satellite') {
                this.map.removeLayer(this.mapLayers.satellite);
                this.mapLayers.dark.addTo(this.map);
                this.mapLayers.current = 'dark';
                document.getElementById('layerToggleBtn').innerHTML = '<i class="fas fa-map"></i>';
                showToast('Mapa alterado para Tema Escuro', 'info');
            } else {
                this.map.removeLayer(this.mapLayers.dark);
                this.mapLayers.satellite.addTo(this.map);
                this.mapLayers.current = 'satellite';
                document.getElementById('layerToggleBtn').innerHTML = '<i class="fas fa-globe"></i>';
                showToast('Mapa alterado para Satélite', 'info');
            }
        } catch (error) {
            console.error('Error toggling map layer:', error);
            showToast('Erro ao alternar mapa', 'error');
        }
    }

    updatePointList() {
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

    updateTable() {
        try {
            if (!this.tableBody) return;

            if (Object.keys(this.model.points).length === 0) {
                this.tableBody.innerHTML = `
                    <tr>
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
                    // <td contenteditable="false" data-field="lat" data-id="${point.id}">${point.lat.toFixed(2)}</td>
                    // <td contenteditable="false" data-field="lng" data-id="${point.id}">${point.lng.toFixed(2)}</td>

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

    updateStats() {
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

    updateSelectionControls() {
        if (!this.selectionControls || !this.selectionCount) return;

        if (this.model.selectedPoints.length > 0 && (this.model.currentMode === 'connect' || this.model.currentMode === 'disconnect')) {
            this.selectionControls.style.display = 'block';
            this.selectionCount.textContent = `${this.model.selectedPoints.length} selecionados`;
        } else {
            this.selectionControls.style.display = 'none';
        }
    }

    updatePreviews() {
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

    updateModeIndicator() {
        if (!this.modeIndicator) return;

        let html = '';
        let className = 'mode-indicator';
        let cursor = '';

        switch (this.model.currentMode) {
            case 'add':
                html = '<i class="fas fa-plus"></i>';
                className += ' active';
                // cursor = 'none';
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
                // cursor = 'copy';
                showToast('Selecione marcadores para conectar', 'info', 5000);
                break;
            case 'disconnect':
                html = '<i class="fas fa-unlink"></i>';
                className += ' active';
                cursor = 'no-drop';
                showToast('Selecione marcadores para desconectar', 'info', 5000);
                break;
            default:
                html = '<i class="fas fa-mouse-pointer"></i>';
                cursor = '';
                break;
        }

        this.modeIndicator.innerHTML = html;
        this.modeIndicator.className = className;
        this.map.getContainer().style.cursor = cursor;
    }

    updatePointPopup(id) {
        const point = this.model.points[id];
        if (!point || !point.marker) return;

        point.popupContent = createPopupContent(point);
        point.marker.bindPopup(point.popupContent, { maxWidth: 300, className: 'custom-popup' });

        const popup = point.marker.getPopup();
        if (popup && popup.isOpen()) {
            popup.setContent(point.popupContent);
        }
    }

    updateMarkerPosition(id) {
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

    focusOnPoint(id) {
        const point = this.model.points[id];
        if (!point) return;

        this.map.flyTo([point.lat, point.lng], 16, { duration: 1.5 });
        setTimeout(() => {
            if (point.marker) point.marker.openPopup();
        }, 1000);
    }

    fitBounds() {
        if (Object.keys(this.model.points).length > 0) {
            const group = new L.featureGroup(Object.values(this.model.points).map(p => p.marker));
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    resetHandlers() {
        Object.values(this.model.points).forEach(point => {
            if (point.marker) {
                if (point.selectHandler) point.marker.off('click', point.selectHandler);
                if (point.removeHandler) point.marker.off('click', point.removeHandler);
                point.selectHandler = null;
                point.removeHandler = null;
                point.marker.unbindPopup();
                point.marker.bindPopup(point.popupContent, { maxWidth: 300, className: 'custom-popup' });
            }
        });
    }

    toggleGPS() {
        if (this.isLocating) {
            this.map.stopLocate();
            if (this.locationMarker) {
                this.map.removeLayer(this.locationMarker);
                this.locationMarker = null;
            }
            if (this.accuracyCircle) {
                this.map.removeLayer(this.accuracyCircle);
                this.accuracyCircle = null;
            }
            this.isLocating = false;
            showToast('Rastreamento GPS desativado', 'info');
            document.getElementById('gpsBtn').innerHTML = '<i class="fas fa-location-crosshairs"></i>'; 
            document.getElementById('gpsBtn').style.color = 'var(--text-primary)'
            document.getElementById('gpsBtn').style.animation = '';
        } else {
            this.map.locate({
                watch: true, // Ativa rastreamento contínuo
                enableHighAccuracy: true, // Usa GPS para mais precisão
                maxZoom: 16, // Limite de zoom
                timeout: 10000 // Timeout para erro
            });
            this.isLocating = true;
            showToast('Rastreamento GPS ativado', 'success');
            document.getElementById('gpsBtn').innerHTML = '<i class="fas fa-location-crosshairs"></i>'; 
            document.getElementById('gpsBtn').style.color = 'var(--primary)'
            document.getElementById('gpsBtn').style.animation = 'blink 2s infinite';
        }
    }

    onLocationFound(e) {
        const radius = e.accuracy/10; 

        if (!this.locationMarker) {
            this.locationMarker = L.circleMarker(e.latlng, {
                radius: 8,
                fillColor: '#3388ff', // Azul clássico de GPS
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0.8
            }).addTo(this.map)
            .bindPopup('Sua localização atual<br>Precisão: ' + Math.round(e.accuracy/10) + ' metros');
        } else {
            this.locationMarker.setLatLng(e.latlng);
        }

        if (!this.accuracyCircle) {
            this.accuracyCircle = L.circle(e.latlng, {
                radius: radius,
                weight: 1,
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.15
            }).addTo(this.map);
        } else {
            this.accuracyCircle.setLatLng(e.latlng);
            this.accuracyCircle.setRadius(radius);
        }
    }

    onLocationError(e) {
        showToast('Erro no GPS: ' + e.message, 'error');
        this.toggleGPS(); // Desativa se houver erro persistente
    }
}