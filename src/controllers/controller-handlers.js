import { showToast } from '../utils/utils.js';

export function initHandlers() {
    this.view.map.on('click', this.handleMapClick.bind(this));
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));

    document.getElementById('layerToggleBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.view.toggleMapLayer();
    });

    const gpsBtn = document.getElementById('gpsBtn');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', this.toggleGPS.bind(this));
    }
}

export function handleMapClick(e) {
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

export function handleKeyboardShortcuts(e) {
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

export function handleResize() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth > 768) {
        sidebar.classList.remove('open');
    }
    setTimeout(() => this.view.map.invalidateSize(), 300);
}