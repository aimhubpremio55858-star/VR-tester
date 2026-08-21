/* =====================================================
   VR BOX MR
   SISTEMA PRINCIPAL
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const camera =
    document.getElementById(
        "camera"
    );

const startup =
    document.getElementById(
        "startup"
    );

const startButton =
    document.getElementById(
        "startButton"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const vrPanel =
    document.getElementById(
        "vrPanel"
    );

const panelHeader =
    document.getElementById(
        "panelHeader"
    );

const handCursor =
    document.getElementById(
        "handCursor"
    );

const handStatus =
    document.getElementById(
        "handStatus"
    );

const statusText =
    document.getElementById(
        "statusText"
    );

const mrStatus =
    document.getElementById(
        "mrStatus"
    );

const appWindow =
    document.getElementById(
        "appWindow"
    );

const windowTitle =
    document.getElementById(
        "windowTitle"
    );

const windowContent =
    document.getElementById(
        "windowContent"
    );

const closeWindow =
    document.getElementById(
        "closeWindow"
    );


/* =====================================================
   DEBUG
===================================================== */

const debugMR =
    document.getElementById(
        "debugMR"
    );

const debugHand =
    document.getElementById(
        "debugHand"
    );

const debugPinch =
    document.getElementById(
        "debugPinch"
    );

const debug3dof =
    document.getElementById(
        "debug3dof"
    );


/* =====================================================
   VARIÁVEIS
===================================================== */

let cameraStream = null;

let handTracker = null;

let handActive = false;

let pinchActive = false;

let previousPinch = false;

let lastHandTime = 0;


/* =====================================================
   3DOF
===================================================== */

let rotationX = 0;

let rotationY = 0;

let rotationZ = 0;

let baseAlpha = null;

let baseBeta = null;

let baseGamma = null;


/* =====================================================
   POSIÇÃO DO MENU
===================================================== */

let panelX = 0;

let panelY = 0;

let panelZ = -700;


/* =====================================================
   ARRASTAR COM A MÃO
===================================================== */

let draggingPanel = false;

let dragStartX = 0;

let dragStartY = 0;

let dragPanelX = 0;

let dragPanelY = 0;


/* =====================================================
   INICIAR SISTEMA
===================================================== */

startButton.addEventListener(
    "click",
    startVR
);


async function startVR() {

    startButton.disabled =
        true;

    startButton.textContent =
        "📷 INICIANDO...";

    errorMessage.textContent =
        "";


    try {

        await startCamera();

        setup3DoF();

        setupHandTracking();

        setupButtons();


        startup.style.display =
            "none";


        updateStatus(
            "3DoF • MR • ATIVO"
        );


        handStatus.textContent =
            "✋ Mostre sua mão";


    }

    catch(error) {

        console.error(
            error
        );


        startButton.disabled =
            false;

        startButton.textContent =
            "📷 TENTAR NOVAMENTE";


        showCameraError(
            error
        );

    }

}


/* =====================================================
   CÂMERA
===================================================== */

async function startCamera() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        throw new Error(
            "CAMERA_UNSUPPORTED"
        );

    }


    cameraStream =
        await navigator.mediaDevices
            .getUserMedia({

                video: {

                    facingMode: {
                        ideal:
                            "environment"
                    },

                    width: {
                        ideal:
                            1280
                    },

                    height: {
                        ideal:
                            720
                    },

                    frameRate: {
                        ideal:
                            30
                    }

                },

                audio: false

            });


    camera.srcObject =
        cameraStream;


    await waitForVideo();


    await camera.play();


    debugMR.textContent =
        "ON";


    handStatus.textContent =
        "📷 MR ativa";

}


/* =====================================================
   ESPERAR VÍDEO
===================================================== */

function waitForVideo() {

    return new Promise(
        resolve => {

            if (
                camera.readyState >= 2
            ) {

                resolve();

                return;

            }


            camera.onloadedmetadata =
                () => {

                    resolve();

                };

        }
    );

}


/* =====================================================
   ERROS DA CÂMERA
===================================================== */

function showCameraError(
    error
) {

    let message =
        "❌ Não foi possível abrir a câmera.";


    if (
        error?.name ===
        "NotAllowedError"
    ) {

        message =
            "🚫 Permissão da câmera negada.\n\n" +
            "Abra as permissões do navegador " +
            "e permita a câmera.";

    }


    else if (
        error?.name ===
        "NotFoundError"
    ) {

        message =
            "❌ Nenhuma câmera encontrada.";

    }


    else if (
        error?.name ===
        "NotReadableError"
    ) {

        message =
            "⚠️ A câmera está sendo usada " +
            "por outro aplicativo.";

    }


    else if (
        error?.name ===
        "SecurityError"
    ) {

        message =
            "🔒 O navegador bloqueou a câmera.";

    }


    else if (
        error?.message ===
        "CAMERA_UNSUPPORTED"
    ) {

        message =
            "❌ Este navegador não oferece " +
            "acesso à câmera.";

    }


    else if (
        location.protocol !==
        "https:"
    ) {

        message =
            "🔒 O acesso à câmera precisa " +
            "de HTTPS.\n\n" +
            "Use o GitHub Pages.";

    }


    errorMessage.textContent =
        message;

}


/* =====================================================
   STATUS
===================================================== */

function updateStatus(
    text
) {

    statusText.textContent =
        text;

    mrStatus.style.background =
        "#50e0ff";

}


/* =====================================================
   3DOF
===================================================== */

function setup3DoF() {

    window.addEventListener(
        "deviceorientation",
        handleOrientation,
        true
    );


    debug3dof.textContent =
        "ON";

}


/* =====================================================
   ORIENTAÇÃO DO CELULAR
===================================================== */

function handleOrientation(
    event
) {

    const alpha =
        event.alpha || 0;

    const beta =
        event.beta || 0;

    const gamma =
        event.gamma || 0;


    if (
        baseAlpha === null
    ) {

        baseAlpha =
            alpha;

        baseBeta =
            beta;

        baseGamma =
            gamma;

    }


    rotationY =
        (alpha - baseAlpha)
        * .08;


    rotationX =
        (beta - baseBeta)
        * -.08;


    rotationZ =
        (gamma - baseGamma)
        * .04;


    updatePanel();

}


/* =====================================================
   ATUALIZAR MENU 3D
===================================================== */

function updatePanel() {

    vrPanel.style.transform = `

        translate(
            calc(-50% + ${panelX}px),
            calc(-50% + ${panelY}px)
        )

        translateZ(
            ${panelZ}px
        )

        rotateX(
            ${rotationX}deg
        )

        rotateY(
            ${rotationY}deg
        )

        rotateZ(
            ${rotationZ}deg
        )

    `;

}


/* =====================================================
   HAND TRACKING
===================================================== */

function setupHandTracking() {

    if (
        typeof Hands ===
        "undefined"
    ) {

        handStatus.textContent =
            "⚠️ Hand Tracking indisponível.";

        return;

    }


    handTracker =
        new Hands({

            locateFile:
                function(file) {

                    return (
                        "https://cdn.jsdelivr.net/npm/" +
                        "@mediapipe/hands/" +
                        file
                    );

                }

        });


    handTracker.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence:
            .65,

        minTrackingConfidence:
            .65

    });


    handTracker.onResults(
        processHandResults
    );


    handActive =
        true;


    requestHandFrame();

}


/* =====================================================
   PROCESSAR FRAMES
===================================================== */

async function requestHandFrame() {

    if (!handActive) {

        return;

    }


    if (
        camera.readyState >= 2 &&
        handTracker
    ) {

        try {

            await handTracker.send({

                image:
                    camera

            });

        }

        catch(error) {

            console.log(
                "Hand frame:",
                error
            );

        }

    }


    requestAnimationFrame(
        requestHandFrame
    );

}


/* =====================================================
   RESULTADO DA MÃO
===================================================== */

function processHandResults(
    results
) {

    const hands =
        results.multiHandLandmarks;


    if (
        !hands ||
        hands.length === 0
    ) {

        handLost();

        return;

    }


    const landmarks =
        hands[0];


    const index =
        landmarks[8];

    const thumb =
        landmarks[4];


    const x =
        index.x *
        window.innerWidth;


    const y =
        index.y *
        window.innerHeight;


    moveHandCursor(
        x,
        y
    );


    debugHand.textContent =
        "ON";


    handStatus.textContent =
        "✋ Mão detectada";


    const distance =
        calculateDistance(
            index,
            thumb
        );


    const pinch =
        distance < .065;


    debugPinch.textContent =
        pinch ?
        "ON" :
        "OFF";


    if (pinch) {

        handCursor.classList.add(
            "pinching"
        );

        handStatus.textContent =
            "🤏 Pinça";

    }

    else {

        handCursor.classList.remove(
            "pinching"
        );

    }


    handleHandHover(
        x,
        y
    );


    if (
        pinch &&
        !previousPinch
    ) {

        handleHandClick(
            x,
            y
        );

    }


    previousPinch =
        pinch;


    lastHandTime =
        Date.now();

}


/* =====================================================
   MÃO PERDIDA
===================================================== */

function handLost() {

    debugHand.textContent =
        "OFF";

    debugPinch.textContent =
        "OFF";


    handCursor.style.display =
        "none";


    previousPinch =
        false;


    handStatus.textContent =
        "✋ Mostre sua mão";

}


/* =====================================================
   MOVER CURSOR
===================================================== */

function moveHandCursor(
    x,
    y
) {

    handCursor.style.display =
        "block";


    handCursor.style.left =
        x + "px";


    handCursor.style.top =
        y + "px";

}


/* =====================================================
   DISTÂNCIA ENTRE PONTOS
===================================================== */

function calculateDistance(
    a,
    b
) {

    const dx =
        a.x - b.x;

    const dy =
        a.y - b.y;

    const dz =
        a.z - b.z;


    return Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
    );

}


/* =====================================================
   HOVER DA MÃO
===================================================== */

function handleHandHover(
    x,
    y
) {

    document
        .querySelectorAll(
            ".hand-hover"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "hand-hover"
                );

            }
        );


    const element =
        document.elementFromPoint(
            x,
            y
        );


    if (!element) {

        return;

    }


    const app =
        element.closest(
            ".app-card"
        );


    if (app) {

        app.classList.add(
            "hand-hover"
        );

    }

}


/* =====================================================
   CLIQUE DA MÃO
===================================================== */

function handleHandClick(
    x,
    y
) {

    const element =
        document.elementFromPoint(
            x,
            y
        );


    if (!element) {

        return;

    }


    const app =
        element.closest(
            ".app-card"
        );


    if (app) {

        openApp(
            app.dataset.app
        );

        return;

    }


    if (
        element.id ===
        "closeWindow"
    ) {

        closeApp();

    }

}


/* =====================================================
   BOTÕES DOS APPS
===================================================== */

function setupButtons() {

    document
        .querySelectorAll(
            ".app-card"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openApp(
                            button.dataset.app
                        );

                    }
                );

            }
        );


    closeWindow.addEventListener(
        "click",
        closeApp
    );

}


/* =====================================================
   ABRIR APLICATIVO
===================================================== */

function openApp(
    app
) {

    appWindow.classList.add(
        "open"
    );


    if (
        app ===
        "youtube"
    ) {

        openYouTube();

    }


    else if (
        app ===
        "games"
    ) {

        openGames();

    }


    else if (
        app ===
        "videos"
    ) {

        openVideos();

    }


    else if (
        app ===
        "music"
    ) {

        openMusic();

    }


    else if (
        app ===
        "browser"
    ) {

        openBrowser();

    }


    else if (
        app ===
        "settings"
    ) {

        openSettings();

    }

}


/* =====================================================
   YOUTUBE
===================================================== */

function openYouTube() {

    windowTitle.textContent =
        "▶️ YouTube VR";


    windowContent.innerHTML = `

        <div class="internal">

            <h1>
                ▶️ YouTube
            </h1>

            <p>
                Digite o ID de um vídeo
                para assistir dentro do
                painel VR.
            </p>

            <div class="youtube-search">

                <input
                    id="youtubeInput"
                    placeholder="ID do vídeo">

                <button
                    id="youtubeButton">

                    Assistir

                </button>

            </div>

            <div
                id="youtubePlayer">
            </div>

        </div>

    `;


    document
        .getElementById(
            "youtubeButton"
        )
        .addEventListener(
            "click",
            playYouTube
        );

}


/* =====================================================
   REPRODUZIR YOUTUBE
===================================================== */

function playYouTube() {

    const input =
        document.getElementById(
            "youtubeInput"
        );


    const id =
        input.value.trim();


    if (!id) {

        return;

    }


    document
        .getElementById(
            "youtubePlayer"
        )
        .innerHTML = `

        <iframe

            class="youtube-player"

            src="
                https://www.youtube.com/embed/${encodeURIComponent(id)}
            "

            allow="
                autoplay;
                encrypted-media;
                picture-in-picture"

            allowfullscreen>

        </iframe>

    `;

}


/* =====================================================
   JOGOS
===================================================== */

function openGames() {

    windowTitle.textContent =
        "🎮 Jogos";


    windowContent.innerHTML = `

        <div
            class="internal"
            style="text-align:center">

            <div
                style="
                font-size:80px;
                margin-top:30px;">

                🎮

            </div>

            <h1>
                Biblioteca VR
            </h1>

            <p>
                Seus jogos podem ser
                adicionados nesta área.
            </p>

            <button
                id="startMiniGame"
                style="
                margin-top:30px;
                padding:15px 25px;
                border:0;
                border-radius:15px;
                background:#187cff;
                color:white;
                font-weight:bold;">

                🚀 Iniciar jogo

            </button>

        </div>

    `;


    document
        .getElementById(
            "startMiniGame"
        )
        .addEventListener(
            "click",
            miniGame
        );

}


/* =====================================================
   MINI GAME
===================================================== */

function miniGame() {

    windowContent.innerHTML = `

        <div
            class="internal"
            style="
            text-align:center;
            position:relative;">

            <h1>
                🎯 Pegue o alvo!
            </h1>

            <p>
                Use a mão ou toque.
            </p>

            <button
                id="target"
                style="
                position:absolute;
                left:50%;
                top:50%;
                transform:
                translate(-50%,-50%);
                width:100px;
                height:100px;
                border:0;
                border-radius:50%;
                background:#ff315c;
                color:white;
                font-size:30px;">

                🎯

            </button>

        </div>

    `;


    document
        .getElementById(
            "target"
        )
        .addEventListener(
            "click",
            () => {

                alert(
                    "🎉 Você acertou!"
                );

            }
        );

}


/* =====================================================
   VÍDEOS
===================================================== */

function openVideos() {

    windowTitle.textContent =
        "🎬 Vídeos";


    windowContent.innerHTML = `

        <div class="internal">

            <h1>
                🎬 Seus vídeos
            </h1>

            <p>
                Abra um vídeo do a
