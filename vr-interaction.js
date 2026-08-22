// Interação com objetos VR
class VRInteraction {
    constructor() {
        this.objects = [];
        this.selectedObject = null;
        this.isMixedRealityActive = true;
    }

    initialize() {
        // Obter todos os objetos interativos
        document.querySelectorAll('.vr-object').forEach(obj => {
            this.objects.push({
                element: obj,
                id: obj.dataset.id,
                originalScale: 1,
                rotation: 0,
                x: obj.offsetLeft,
                y: obj.offsetTop
            });
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        const toggleMRBtn = document.getElementById('toggleMR');
        const resetBtn = document.getElementById('reset');
        const fullscreenBtn = document.getElementById('toggleFullscreen');

        toggleMRBtn.addEventListener('click', () => this.toggleMixedReality());
        resetBtn.addEventListener('click', () => this.reset());
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    update(palmPosition, gesture) {
        // Atualizar cursor de mão
        const cursor = document.getElementById('hand-cursor');
        cursor.style.left = palmPosition.x + 'px';
        cursor.style.top = palmPosition.y + 'px';

        // Detectar colisão com objetos
        this.checkCollisions(palmPosition, gesture);
    }

    checkCollisions(palmPosition, gesture) {
        let hitObject = null;

        this.objects.forEach(obj => {
            const rect = obj.element.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(palmPosition.x - (rect.left + rect.width / 2), 2) +
                Math.pow(palmPosition.y - (rect.top + rect.height / 2), 2)
            );

            // Se a mão está perto do objeto (100px)
            if (distance < 100) {
                hitObject = obj;
                
                // Destacar objeto
                if (this.selectedObject !== obj) {
                    this.unhighlightAll();
                    this.highlight(obj);
                    this.selectedObject = obj;
                }

                // Executar ação baseado no gesto
                if (gesture === 'PINCH') {
                    this.onPinch(obj);
                } else if (gesture === 'FIST') {
                    this.onGrab(obj);
                }
            }
        });

        // Deselecionar se não houver colisão
        if (!hitObject && this.selectedObject) {
            this.unhighlightAll();
            this.selectedObject = null;
        }
    }

    highlight(obj) {
        obj.element.classList.add('highlighted');
    }

    unhighlightAll() {
        this.objects.forEach(obj => {
            obj.element.classList.remove('highlighted');
        });
    }

    onPinch(obj) {
        obj.element.classList.add('pinched');
        obj.originalScale += 0.05;
        obj.element.style.transform = `scale(${obj.originalScale})`;
        
        setTimeout(() => {
            obj.element.classList.remove('pinched');
        }, 300);
    }

    onGrab(obj) {
        obj.element.classList.add('grabbed');
        obj.rotation += 45;
        obj.element.style.transform = `rotateZ(${obj.rotation}deg) scale(${obj.originalScale})`;
        
        setTimeout(() => {
            obj.element.classList.remove('grabbed');
        }, 500);
    }

    toggleMixedReality() {
        this.isMixedRealityActive = !this.isMixedRealityActive;
        const canvas = document.getElementById('canvas');
        const video = document.getElementById('video');
        
        if (this.isMixedRealityActive) {
            canvas.style.opacity = '1';
            video.style.display = 'block';
        } else {
            canvas.style.opacity = '0.1';
            video.style.display = 'none';
        }

        const btn = document.getElementById('toggleMR');
        btn.textContent = this.isMixedRealityActive ? '🔄 Toggle AR' : '🔄 AR Desligado';
    }

    reset() {
        this.objects.forEach(obj => {
            obj.originalScale = 1;
            obj.rotation = 0;
            obj.element.style.transform = 'scale(1) rotateZ(0deg)';
        });
    }

    toggleFullscreen() {
        const container = document.querySelector('.vr-container');
        container.classList.toggle('fullscreen');
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen().catch(err => {
                console.log('Fullscreen não disponível:', err);
            });
        }
    }

    getStats() {
        return {
            detectedObjects: this.objects.length,
            selectedObject: this.selectedObject ? this.selectedObject.id : 'Nenhum',
            mixedRealityActive: this.isMixedRealityActive
        };
    }
}

// Exportar para uso global
const vrInteraction = new VRInteraction();
          
