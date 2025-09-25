function showToast(message, type = 'info', duration = 4000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> ${message}`;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function createPopupContent(point) {
    return `
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; color: #3B82F6; font-size: 16px; font-weight: 700;">${point.name}</h3>
                <div style="display: flex; gap: 12px;">
                    <i class="fas fa-edit" style="color: #F59E0B; cursor: url('https://i.ibb.co/LXmQ0XGv/icons8-cursor-24-1-removebg-preview.png'), auto;" onclick="editPoint(${point.id})"></i>
                    <i class="fas fa-trash" style="color: #EF4444; cursor: url('https://i.ibb.co/LXmQ0XGv/icons8-cursor-24-1-removebg-preview.png'), auto;" onclick="deletePoint(${point.id})"></i>
                </div>
            </div>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748B; line-height: 1.4;">${point.description || 'Sem descrição'}</p>
            <small style="font-size: 12px; color: #94A3B8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px; display: inline-block;">
                ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
            </small>
        </div>
    `;
}

function createMarkerIcon(id, isSelected = false) {
    const size = isSelected ? 100 : 110;
    const iconSize = isSelected ? 34 : 28;
    const color = isSelected ? '#F59E0B' : '#3B82F6';
    const gradientEnd = isSelected ? '#D97706' : '#1E40AF';
    const shadow = isSelected ? '0 8px 25px rgba(245, 158, 11, 0.5)' : '0 6px 20px rgba(59, 130, 246, 0.4)';
    const animation = isSelected ? 'animation: pulse 1.5s ease-in-out infinite;' : '';

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: linear-gradient(135deg, ${color}, ${gradientEnd});
            width: ${size}%;
            height: ${size}%;
            border-radius: 10px;
            border: 3px solid white;
            box-shadow: ${shadow};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            ${animation}
        ">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-pin-fill" viewBox="0 0 16 16">
        <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354"/>
        </svg>
        
        </div>`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize/2],
        popupAnchor: [0, -iconSize/2]
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}