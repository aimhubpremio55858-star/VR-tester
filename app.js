// Aplicação principal
class VRBoxApp {
    constructor() {
        this.handTracker = handTracker;
        this.vrInteraction = vrInteraction;
        this.animationId = null;
    }

    async initialize() {
        console.log('🚀 Inicializando VR Box App...');

        try {
            // Inicializar hand tracker
            await this.handTracker.initialize();
            console.log('✅ Hand Tracker inicializado');

            // Resize canvas
            this.handTracker.resizeCanvas();
            window.addEventListener('resize', () => this.handTracker.resizeCanvas());

            // Inicializar interações VR
            this.vrInteraction.initialize();
            console.log('✅ VR Interaction inicializado');

            // Pedir permissão de câmera
            await this.requestCameraPermission();

            // Ativar hand cursor
            const cursor = document.getElementById('hand-cursor');
            cursor.classList.add('active');

            // Iniciar loop de animação
            this.start();

            console.log('✅ VR Box App iniciado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            this.showError('Erro ao acessar câmera. Verifique as permissões.');
        }
    }

    async requestCameraPermission() {
        try {
            await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
        } catch (error) {
            console.error('Permissão de câmera negada:', error);
            throw error;
        }
    }

    start() {
        this.animate();
    }

    animate() {
        // Obter dados de rastreamento
        const palmPosition = this.handTracker.getPalmPosition();
        const gesture = this.handTracker.getGesture();
        const isDetected = this.handTracker.isHandDetected();

        // Atualizar interações
        this.vrInteraction.update(palmPosition, gesture);

        // Atualizar UI
        this.updateUI(isDetected, gesture);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateUI(isDetected, gesture) {
        // Status
        const statusElement = document.getElementById('status');
        if (isDetected) {
            statusElement.textContent = '✅ Mão Detectada';
            statusElement.parentElement.classList.add('active');
        } else {
            statusElement.textContent = '❌ Aguardando mão...';
            statusElement.parentElement.classList.remove('active');
        }

        // Gesto
        const gestureElement = document.getElementById('gesture');
        gestureElement.textContent = `Gesto: ${gesture}`;

        // FPS
        const fpsElement = document.getElementById('fps');
        fpsElement.textContent = `FPS: ${this.handTracker.getFPS()}`;
    }

    showError(message) {
        const statusPanel = document.querySelector('.status-panel');
        const error = document.createElement('div');
        error.textContent = message;
        error.style.color = '#ff0000';
        error.style.marginTop = '10px';
        statusPanel.appendChild(error);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Inicializar app quando página carregar
document.addEventListener('DOMContentLoaded', async () => {
    const app = new VRBoxApp();
    await app.initialize();

    // Cleanup ao sair
    window.addEventListener('beforeunload', () => {
        app.stop();
    });
});

// Suportar modo toque simulado (para desktop)
document.addEventListener('mousemove', (e) => {
    const cursor = document.getElementById('hand-cursor');
    if (cursor.classList.contains('active')) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

// Simular detecção de mão com toque
document.addEventListener('touchstart', () => {
    console.log('👆 Toque detectado');
});

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const cursor = document.getElementById('hand-cursor');
        cursor.style.left = touch.clientX + 'px';
        cursor.style.top = touch.clientY + 'px';
    }
});

// Suporte para gestos touch
let touchCount = 0;
document.addEventListener('touchstart', (e) => {
    touchCount = e.touches.length;
});

document.addEventListener('touchend', () => {
    touchCount = 0;
});
      
