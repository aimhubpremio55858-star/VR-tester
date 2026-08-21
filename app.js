// ======================================================
// VR BOX MR
// CÂMERA + 3DOF + HAND TRACKING + MENU 3D
// ======================================================


// ======================================================
// ELEMENTOS
// ======================================================

const camera =
    document.getElementById("camera");

const cameraButton =
    document.getElementById("cameraButton");

const permissionScreen =
    document.getElementById(
        "permissionScreen"
    );

const permissionError =
    document.getElementById(
        "permissionError"
    );

const handPointer =
    document.getElementById(
        "handPointer"
    );

const handStatus =
    document.getElementById(
        "handStatus"
    );

const panel =
    document.getElementById("panel");

const panelHeader =
    document.getElementById(
        "panelHeader"
    );

const status =
    document.getElementById("status");

const appWindow =
    document.getElementById(
        "appWindow"
    );

const appContent =
    document.getElementById(
        "appContent"
    );

const appTitle =
    document.getElementById(
        "appTitle"
    );

const closeApp =
    document.getElementById(
        "closeApp"
    );


let cameraStream = null;

let hands = null;

let handRunning = false;

let lastPinch = false;

let handX = 0;

let handY = 0;


// ======================================================
// CÂMERA
// ======================================================

async function startCamera() {

    permissionError.textContent = "";

    cameraButton.textContent =
        "📷 ABRINDO CÂMERA...";

    cameraButton.disabled = true;

    handStatus.textContent =
        "📷 Pedindo permissão da câmera...";


    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "getUserMedia não está disponível."
            );
        }


        // ==========================================
        // TENTA CÂMERA TRASEIRA
        // ==========================================

        cameraStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }

                    },

                    audio: false

                });


        camera.srcObject =
            cameraStream;


        await new Promise(
            resolve => {

                if (
                    camera.readyState >= 1
                ) {

                    resolve();

                } else {

                    camera.onloadedmetadata =
                        resolve;
                }

            }
        );


        await camera.play();


        // ==========================================
        // ESCONDE TELA DE PERMISSÃO
        // ==========================================

        permissionScreen.style.display =
            "none";


        status.textContent =
            "3DoF • MR • ATIVO";


        handStatus.textContent =
            "✋ Procurando sua mão...";


        console.log(
            "Câmera iniciada!"
        );


        // ==========================================
        // INICIA HAND TRACKING
        // ==========================================

        startHandTracking();


        // ==========================================
        // INICIA 3DOF
        // ==========================================

        start3DoF();

    }

    catch(error) {

        console.error(error);

        cameraButton.disabled =
            false;

        cameraButton.textContent =
            "📷 TENTAR NOVAMENTE";


        let msg =
            "Não foi possível abrir a câmera.";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            msg =
                "🚫 Permissão negada.\n" +
                "Permita a câmera para este site.";

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            msg =
                "❌ Nenhuma câmera encontrada.";

        }

        else if (
            error.name ===
            "NotReadableError"
        ) {

            msg =
                "⚠️ A câmera está sendo usada " +
                "por outro aplicativo.";

        }

        else if (
            location.protocol !==
            "https:"
        ) {

            msg =
                "🔒 Abra o projeto pelo GitHub Pages " +
                "usando HTTPS.";

        }


        permissionError.textContent =
            msg;

        handStatus.textContent =
            msg;
    }
}


cameraButton.addEventListener(
    "click",
    startCamera
);


// ======================================================
// 3DOF
// ======================================================

let yaw = 0;

let pitch = 0;

let roll = 0;


function start3DoF() {

    window.addEventListener(
        "deviceorientation",
        event => {

            yaw =
                event.alpha || 0;

            pitch =
                event.beta || 0;

            roll =
                event.gamma || 0;


            update3DoF();

        },
        true
    );

}


function update3DoF() {

    panel.style.transform = `

        translate(-50%, -50%)

        translateZ(-650px)

        rotateX(
            ${pitch * -0.06}deg
        )

        rotateY(
            ${yaw * 0.05}deg
        )

        rotateZ(
            ${roll * 0.03}deg
        )

    `;
}


// ======================================================
// HAND TRACKING
// ======================================================

function startHandTracking() {

    if (
        typeof Hands ===
        "undefined"
    ) {

        handStatus.textContent =
            "⚠️ Hand Tracking não carregou.";

        return;
    }


    hands =
        new Hands({

            locateFile: file => {

                return (
                    "https://cdn.jsdelivr.net/npm/" +
                    "@mediapipe/hands/" +
                    file
                );

            }

        });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: .6,

        minTrackingConfidence: .6

    });


    hands.onResults(
        onHandResults
    );


    handRunning = true;

    processHand();
}


// ======================================================
// PROCESSAR MÃO
// ======================================================

async function processHand() {

    if (!handRunning) {
        return;
    }


    if (
        camera.readyState >= 2
    ) {

        try {

            await hands.send({
                image: camera
            });

        }

        catch(error) {

            console.error(
                "Hand Tracking:",
                error
            );

        }

    }


    requestAnimationFrame(
        processHand
    );
}


// ======================================================
// RESULTADO DA MÃO
// ======================================================

function onHandResults(results) {

    if (
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length === 0
    ) {

        handPointer.style.display =
            "none";

        handStatus.textContent =
            "✋ Mostre sua mão para a câmera.";

        removeHover();

        return;
    }


    const landmarks =
        results.multiHandLandmarks[0];


    // ==========================================
    // DEDO INDICADOR
    // ==========================================

    const index =
        landmarks[8];


    handX =
        index.x * window.innerWidth;

    handY =
        index.y * window.innerHeight;


    handPointer.style.display =
        "block";


    handPointer.style.left =
        handX + "px";


    handPointer.style.top =
        handY + "px";


    // ==========================================
    // PINÇA
    // indicador + polegar
    // ==========================================

    const thumb =
        landmarks[4];


    const dx =
        index.x - thumb.x;

    const dy =
        index.y - thumb.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const pinch =
        distance < .055;


    if (pinch) {

        handPointer.classList.add(
            "pinch"
        );

        handStatus.textContent =
            "🤏 Pinça detectada";

    } else {

        handPointer.classList.remove(
            "pinch"
        );

        handStatus.textContent =
            "✋ Mão detectada";
    }


    // ==========================================
    // HOVER
    // ==========================================

    updateHandHover(
        handX,
        handY
    );


    // ==========================================
    // CLIQUE POR PINÇA
    // ==========================================

    if (
        pinch &&
        !lastPinch
    ) {

        handClick(
            handX,
            handY
        );

    }


    lastPinch =
        pinch;
}


// ======================================================
// HOVER
// ======================================================

function updateHandHover(x, y) {

    removeHover();


    const element =
        document.elementFromPoint(
            x,
            y
        );


    if (
        element &&
        element.closest(".app")
    ) {

        element
            .closest(".app")
            .classList.add(
                "handHover"
            );
    }

}


function removeHover() {

    document
        .querySelectorAll(".handHover")
        .forEach(element => {

            element.classList.remove(
                "handHover"
            );

        });
}


// ======================================================
// CLIQUE COM A MÃO
// ======================================================

function handClick(x, y) {

    const element =
        document.elementFromPoint(
            x,
            y
        );


    if (!element) {
        return;
    }


    const app =
        element.closest(".app");


    if (app) {

        const name =
            app.dataset.app;

        openApp(name);

        return;
    }


    if (
        element.id ===
        "closeApp"
    ) {

        closeApplication();

    }

}


// ======================================================
// BOTÕES NORMAIS
// ======================================================

document
    .querySelectorAll(".app")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openApp(
                    button.dataset.app
                );

            }
        );

    });


closeApp.addEventListener(
    "click",
    closeApplication
);


// ======================================================
// ABRIR APPS
// ======================================================

function openApp(app) {

    appWindow.classList.add(
        "active"
    );


    // ==========================================
    // YOUTUBE
    // ==========================================

    if (app === "youtube") {

        appTitle.textContent =
            "▶️ YouTube";


        appContent.innerHTML = `

            <div class="internalApp youtubeBox">

                <h1>
                    ▶️ YouTube VR
                </h1>

                <p>
                    Digite o ID de um vídeo
                    do YouTube.
                </p>

                <input
                    id="youtubeId"
                    placeholder="Ex: dQw4w9WgXcQ"
                >

                <button
                    id="youtubePlay">
                    ▶ Assistir
                </button>

                <div id="youtubePlayer">
                </div>

            </div>

        `;


        document
            .getElementById(
                "youtubePlay"
            )
            .onclick = playYouTube;

    }


    // ==========================================
    // JOGOS
    // ==========================================

    else if (app === "games") {

        appTitle.textContent =
            "🎮 Jogos";


        appContent.innerHTML = `

            <div class="internalApp"
                 style="text-align:center">

                <div style="
                    font-size:80px;
                    margin-top:50px;
                ">
                    🎮
                </div>

                <h1>
                    Central de Jogos
                </h1>

                <p>
                    Seus jogos poderão
                    ficar dentro desta área.
                </p>

                <button
                    onclick="miniGame()"
                    style="
                        padding:15px 25px;
                        border:0;
                        border-radius:15px;
                        background:#147cff;
                        color:white;
                        font-weight:bold;
                    ">
                    🚀 Testar jogo
                </button>

            </div>

        `;

    }


    // ==========================================
    // VÍDEOS
    // ==========================================

    else if (app === "videos") {

        appTitle.textContent =
            "🎬 Vídeos";


        appContent.innerHTML = `

            <div class="internalApp"
                 style="text-align:center">

                <h1>
                    🎬 Vídeos
                </h1>

                <p>
                    Central de vídeos VR.
                </p>

                <input
                    type="file"
                    accept="video/*"
                    id="videoFile"
                >

                <video
                    id="localVideo"
                    controls
                    style="
                        width:100%;
                        max-height:70%;
                        margin-top:20px;
                    ">
                </video>

            </div>

        `;


        document
            .getElementById("videoFile")
            .onchange = event => {

                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }


                const url =
                    URL.createObjectURL(
                        file
                    );


                document
                    .getElementById(
                        "localVideo"
                    )
                    .src = url;

            };

    }


    // ==========================================
    // MÚSICA
    // ==========================================

    else if (app === "music") {

        appTitle.textContent =
            "🎵 Música";


        appContent.innerHTML = `

            <div class="internalApp"
                 style="text-align:center">

                <h1>
                    🎵 Música
                </h1>

                <p>
                    Selecione uma música
                    do aparelho.
                </p>

                <input
                    type="file"
                    accept="audio/*"
                    id="audioFile"
                >

                <audio
                    id="audioPlayer"
                    controls
                    style="
                        width:100%;
                        margin-top:30px;
                    ">
                </audio>

            </div>

        `;


        document
            .getElementById("audioFile")
            .onchange = event => {

                const file =
                    event.target.files[0];

                if (!file) {
                    return;
                }


                document
                    .getElementById(
                        "audioPlayer"
                    )
                    .src =
                    URL.createObjectURL(
                        file
                    );

            };

    }


    // ==========================================
    // NAVEGADOR
    // ==========================================

    else if (app === "browser") {

        appTitle.textContent =
            "🌐 Navegador";


        appContent.innerHTML = `

            <div class="internalApp"
                 style="text-align:center">

                <h1>
                    🌐 Navegador
                </h1>

                <p>
                    Alguns sites bloqueiam
                    abertura dentro de iframe.
                </p>

                <button
                    onclick="
                    window.open(
                        'https://www.google.com',
                        '_blank'
                    )"
                    style="
                        padding:15px 25px;
                        border:0;
                        border-radius:15px;
                        background:#147cff;
                        color:white;
                    ">
                    🌐 Abrir navegador
                </button>

            </div>

        `;

    }


    // ==========================================
    // CONFIGURAÇÕES
    // ==========================================

    else if (app === "settings") {

        appTitle.textContent =
            "⚙️ Configurações";


        appContent.innerHTML = `

            <div class="internalApp">

                <h1>
                    ⚙️ Configurações
                </h1>

                <p>
                    VR BOX
                </p>

                <hr>

                <p>
                    🧭 3DoF: ATIVO
                </p>

                <p>
                    📷 MR: ATIVO
                </p>

                <p>
                    ✋ Hand Tracking:
                    ATIVO
                </p>

            </div>

        `;

    }

}


// ======================================================
// YOUTUBE
// ======================================================

function playYouTube() {

    const input =
        document.getElementById(
            "youtubeId"
        );


    const id =
        input.value.trim();


    if (!id) {

        alert(
            "Digite o ID do vídeo."
        );

        return;
    }


    document
        .getElementById(
            "youtubePlayer"
        )
        .innerHTML = `

        <iframe
            class="youtubeVideo"
            src="https://www.youtube.com/embed/${encodeURIComponent(id)}"
            allow="
                autoplay;
                encrypted-media;
                picture-in-picture"
            allowfullscreen>
        </iframe>

    `;

}


// ======================================================
// MINI JOGO DE TESTE
// ======================================================

function miniGame() {

    appContent.innerHTML = `

        <div class="internalApp"
             style="
                text-align:center;
             ">

            <h1>
                🚀 Jogo VR
            </h1>

            <p>
                Pegue o alvo!
            </p>

            <button
                id="target"
                style="
                    position:absolute;
                    left:50%;
                    top:50%;
                    transform:translate(-50%,-50%);
                    width:100px;
                    height:100px;
                    border-radius:50%;
                    border:0;
                    background:#ff315c;
                    color:white;
                    font-size:30px;
                ">
                🎯
            </button>

        </div>
    `;


    document
        .getElementByI
