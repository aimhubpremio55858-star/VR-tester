// Hand Tracker usando MediaPipe
class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.isDetected = false;
        this.palmPosition = { x: 0, y: 0 };
        this.gesture = 'NONE';
        this.landmarks = [];
        this.fps = 0;
        this.lastTime = Date.now();
        this.frameCount = 0;
    }

    async initialize() {
        this.videoElement = document.getElementById('video');
        this.canvasElement = document.getElementById('canvas');

        // Inicializar MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        // Inicializar câmera
        const camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 1280,
            height: 720
        });

        await camera.initialize();
        camera.start();
    }

    onResults(results) {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }

        const ctx = this.canvasElement.getContext('2d');
        
        // Desenhar fundo do vídeo
        ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.isDetected = true;
            
            // Processar cada mão detectada
            results.multiHandLandmarks.forEach((landmarks, index) => {
                this.landmarks = landmarks;
                this.detectGesture(landmarks);
                this.updatePalmPosition(landmarks);
                this.drawHand(ctx, landmarks);
            });
        } else {
            this.isDetected = false;
            this.gesture = 'NONE';
        }
    }

    drawHand(ctx, landmarks) {
        // Cores dos pontos
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;

        // Desenhar conexões entre pontos
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20]
        ];

        connections.forEach(([start, end]) => {
            const startLandmark = landmarks[start];
            const endLandmark = landmarks[end];
            
            ctx.beginPath();
            ctx.moveTo(startLandmark.x * this.canvasElement.width, 
                      startLandmark.y * this.canvasElement.height);
            ctx.lineTo(endLandmark.x * this.canvasElement.width, 
                      endLandmark.y * this.canvasElement.height);
            ctx.stroke();
        });

        // Desenhar pontos
        landmarks.forEach(landmark => {
            ctx.beginPath();
            ctx.arc(landmark.x * this.canvasElement.width, 
                   landmark.y * this.canvasElement.height, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    updatePalmPosition(landmarks) {
        // Posição da palma é o landmark 0 (base da palma)
        const palmLandmark = landmarks[0];
        this.palmPosition = {
            x: palmLandmark.x * this.canvasElement.width,
            y: palmLandmark.y * this.canvasElement.height
        };
    }

    detectGesture(landmarks) {
        // Detector simples de gestos baseado em distância entre dedos
        
        // Thumb (4), Index (8), Middle (12), Ring (16), Pinky (20)
        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];
        const ring = landmarks[16];
        const pinky = landmarks[20];
        
        // Palma
        const palm = landmarks[0];

        // Distâncias
        const thumbIndexDist = this.distance(thumb, index);
        const indexMiddleDist = this.distance(index, middle);
        
        // Finger up detection
        const thumbUp = thumb.y < landmarks[3].y;
        const indexUp = index.y < landmarks[6].y;
        const middleUp = middle.y < landmarks[10].y;
        const ringUp = ring.y < landmarks[14].y;
        const pinkyUp = pinky.y < landmarks[18].y;

        const fingersUp = [indexUp, middleUp, ringUp, pinkyUp].filter(f => f).length;

        // Detecção de gestos
        if (thumbIndexDist < 0.05 && fingersUp <= 1) {
            this.gesture = 'PINCH'; // Pinça
        } else if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
            this.gesture = 'FIST'; // Punho
        } else if (indexUp && middleUp && ringUp && pinkyUp && thumbUp) {
            this.gesture = 'OPEN'; // Palma aberta
        } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
            this.gesture = 'PEACE'; // Sinal de paz
        } else {
            this.gesture = 'NEUTRAL';
        }
    }

    distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getPalmPosition() {
        return this.palmPosition;
    }

    getGesture() {
        return this.gesture;
    }

    isHandDetected() {
        return this.isDetected;
    }

    getFPS() {
        return this.fps;
    }

    resizeCanvas() {
        this.canvasElement.width = window.innerWidth;
        this.canvasElement.height = window.innerHeight;
    }
}

// Exportar para uso global
const handTracker = new HandTracker();
          
