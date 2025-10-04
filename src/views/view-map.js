import * as L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';

import { createPopupContent, createMarkerIcon } from '../utils/utils.js';

export function initMap() {
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
}

export function renderPoint(point, isSelected = false) {
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

export function renderConnection(conn) {
    try {
        const fromPoint = this.model.points[conn.from];
        const toPoint = this.model.points[conn.to];
        console.log('Rendering connection:', { fromPoint, toPoint, conn });
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

export function updateMarkerIcon(id, isSelected) {
    const point = this.model.points[id];
    if (point && point.marker) {
        point.marker.setIcon(createMarkerIcon(id, isSelected));
    }
}

export function removeMarker(id) {
    const point = this.model.points[id];
    if (point && point.marker) {
        this.map.removeLayer(point.marker);
    }
}

export function removePolyline(conn) {
    if (conn.polyline) {
        this.map.removeLayer(conn.polyline);
    }
}

export function toggleMapLayer() {
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

export function fitBounds() {
    if (Object.keys(this.model.points).length > 0) {
        const group = new L.featureGroup(Object.values(this.model.points).map(p => p.marker));
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
}

export function resetHandlers() {
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