

export function enableDrawing() {
    if (this.drawControl) {
        this.map.addControl(this.drawControl);
    }
}

export function disableDrawing() {
    if (this.drawControl) {
        this.map.removeControl(this.drawControl);
    }
}
