// ==========================================
// VR BOX — CÂMERA TRASEIRA + MR
// ==========================================

const camera = document.getElementById("camera");
const status = document.getElementById("status");
const handStatus = document.getElementById("handStatus");

let cameraStream = null;


// ==========================================
// INICIAR CÂMERA
// ==========================================

async function startCamera() {

    console.log("VR BOX: iniciando câmera...");

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        showCameraError(
            "Seu navegador não permite acesso à câmera."
        );

        return;
    }


    handStatus.textContent =
        "📷 Pedindo permissão da câmera...";


    try {

        // Primeira tentativa:
        // câmera traseira

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

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


        // Coloca a câmera no vídeo

        camera.srcObject =
            cameraStream;


        // Aguarda o vídeo carregar

        await new Promise((resolve) => {

            camera.onloadedmetadata =
                resolve;

        });


        await camera.play();


        // ==================================
        // SUCESSO
        // ==================================

        status.textContent =
            "3DoF • MR • CÂMERA";

        handStatus.textContent =
            "📷 MR ativa";


        console.log(
            "VR BOX: câmera traseira ativada!"
        );


        // Descobre qual câmera foi usada

        const tracks =
            cameraStream.getVideoTracks();

        if (tracks.length > 0) {

            console.log(
                "Câmera:",
                tracks[0].label
            );

        }

    }

    catch (error) {

        console.error(
            "Erro da câmera:",
            error
        );


        showCameraError(error);

    }

}


// ==========================================
// ERROS
// ==========================================

function showCameraError(error) {

    let message =
        "❌ Não foi possível iniciar a câmera.";


    if (error?.name === "NotAllowedError") {

        message =
            "🚫 Permissão da câmera foi negada.\n\n" +
            "Permita a câmera para este site.";

    }


    else if (error?.name === "NotFoundError") {

        message =
            "❌ Nenhuma câmera foi encontrada.";

    }


    else if (error?.name === "NotReadableError") {

        message =
            "⚠️ A câmera está sendo usada " +
            "por outro aplicativo.";

    }


    else if (error?.name === "SecurityError") {

        message =
            "🔒 O navegador bloqueou a câmera.";

    }


    handStatus.textContent =
        message;

    status.textContent =
        "MR OFF";


    console.log(message);

}


// ==========================================
// PARAR CÂMERA
// ==========================================

function stopCamera() {

    if (!cameraStream) {
        return;
    }


    cameraStream
        .getTracks()
        .forEach(track => {

            track.stop();

        });


    cameraStream = null;

    camera.srcObject = null;


    status.textContent =
        "MR OFF";

    handStatus.textContent =
        "📷 Câmera desligada";

}


// ==========================================
// INICIAR QUANDO A PÁGINA CARREGAR
// ==========================================

window.addEventListener(
    "load",
    () => {

        startCamera();

    }
);
