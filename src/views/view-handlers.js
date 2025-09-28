export function toggleClassesFromIdExact(id, classA, classB) {
    if (typeof id !== 'string' || typeof classA !== 'string' || typeof classB !== 'string') {
        throw new TypeError('id, classA e classB devem ser strings');
    }

    const all = document.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
        if (all[i].id === id) {
        const el = all[i];
        if (el.classList.contains(classA)) {
            el.classList.remove(classA);
            el.classList.add(classB);
        } else if (el.classList.contains(classB)) {
            el.classList.remove(classB);
            el.classList.add(classA);
        } else {
            // caso não tenha nenhuma das duas, adiciona classA como padrão
            el.classList.add(classA);
        }
        }
    }
}
    
export function addClassId(id, className) {
    if (typeof id !== 'string' || typeof className !== 'string') {
        throw new TypeError('id e className devem ser strings');
    }

    const all = document.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
        if (all[i].id === id) {
        all[i].classList.add(className);
        }
    }
}

export function removeClassId(id, className) {
    if (typeof id !== 'string' || typeof className !== 'string') {
        throw new TypeError('id e className devem ser strings');
    }

    const all = document.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
        if (all[i].id === id) {
        all[i].classList.remove(className);
        }
    }
}