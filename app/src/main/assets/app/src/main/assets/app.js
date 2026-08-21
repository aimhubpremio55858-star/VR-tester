const camera = document.getElementById("camera");
const menu = document.getElementById("menu");
const handStatus = document.getElementById("hand-status");

let cameraStream = null;
let rotX = 0;
let rotY = 0;

// ===============================
// CÂMERA / REALIDADE MISTA
// ===============================

async function iniciarCamera() {

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                },
                width: {
                    ideal: 1920
                },
                height: {
                    ideal: 1080
                }
            },
            audio: false
        });

        camera.srcObject = cameraStream;

        camera.style.display = "block";

        document.getElementById("camera-button").style.display = "none";

        handStatus.innerText =
            "✋ Hand Tracking: câmera ativa";

    } catch (erro) {

        console.error(erro);

        handStatus.innerText =
            "⚠️ Permissão da câmera recusada";

        alert(
            "Permita o acesso à câmera nas configurações do Android."
        );
    }
}


// ===============================
// 3DOF
// Movimento do celular/cabeça
// ===============================

function iniciar3DOF() {

    if (
        typeof DeviceOrientationEvent !==
        "undefined" &&
        typeof DeviceOrientationEvent.requestPermission ===
        "function"
    ) {

        DeviceOrientationEvent
            .requestPermission()
            .then(function(permission) {

                if (permission === "granted") {

                    window.addEventListener(
                        "deviceorientation",
                        controlar3DOF
                    );
                }
            })
            .catch(console.error);

    } else {

        window.addEventListener(
            "deviceorientation",
            controlar3DOF
        );
    }
}


function controlar3DOF(event) {

    if (event.beta === null ||
        event.gamma === null) {
        return;
    }

    rotX = event.beta;
    rotY = event.gamma;

    const limiteX = Math.max(
        -35,
        Math.min(35, rotX)
    );

    const limiteY = Math.max(
        -35,
        Math.min(35, rotY)
    );

    menu.style.transform =
        "translate(-50%, -50%) " +
        "perspective(1000px) " +
        "rotateX(" +
        (-limiteX * 0.25) +
        "deg) " +
        "rotateY(" +
        (limiteY * 0.35) +
        "deg)";
}


// ===============================
// HAND TRACKING
// Base para interação por gesto
// ===============================

let handX = 0;
let handY = 0;

function iniciarHandTracking() {

    handStatus.innerText =
        "✋ Hand Tracking: pronto";

    document.addEventListener(
        "pointermove",
        function(event) {

            handX = event.clientX;
            handY = event.clientY;

            verificarCursor();
        }
    );
}


function verificarCursor() {

    const elemento =
        document.elementFromPoint(
            handX,
            handY
        );

    if (
        elemento &&
        elemento.classList.contains("app")
    ) {

        elemento.classList.add(
            "hand-hover"
        );

    } else {

        document
            .querySelectorAll(".app")
            .forEach(function(botao) {

                botao.classList.remove(
                    "hand-hover"
                );
            });
    }
}


// ===============================
// APLICATIVOS
// ===============================

function abrirYouTube() {

    window.location.href =
        "https://www.youtube.com/";
}


function abrirNavegador() {

    window.location.href =
        "https://www.google.com/";
}


function abrirJogos() {

    alert(
        "🎮 Área de jogos VR BOX\n\n" +
        "Em breve você poderá adicionar " +
        "jogos WebXR aqui."
    );
}


function abrirVideos() {

    alert(
        "🎬 Central de vídeos VR BOX"
    );
}


function abrirMusica() {

    alert(
        "🎵 Central de música VR BOX"
    );
}


function abrirConfiguracoes() {

    alert(
        "⚙️ Configurações\n\n" +
        "Modo: 3DoF\n" +
        "Realidade Mista: disponível\n" +
        "Câmera: controlada pelo Android"
    );
}


// ===============================
// INICIALIZAÇÃO
// ===============================

window.addEventListener(
    "load",
    function() {

        iniciar3DOF();

        iniciarHandTracking();

        setTimeout(
            function() {

                handStatus.innerText =
                    "✋ Aponte para o menu";

            },
            1000
        );
    }
);
