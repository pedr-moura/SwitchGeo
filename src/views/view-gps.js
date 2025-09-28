import { showToast } from '../utils/utils.js';
import * as L from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js';

export function toggleGPS() {
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

export function onLocationFound(e) {
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

export function onLocationError(e) {
    showToast('Erro no GPS: ' + e.message, 'error');
    this.toggleGPS(); // Desativa se houver erro persistente
}