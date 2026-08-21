// VR BOX - app.js

document.addEventListener("DOMContentLoaded", function () {

    console.log("VR BOX iniciado!");

    // Botão da câmera
    const cameraButton = document.getElementById("camera");

    if (cameraButton) {
        cameraButton.addEventListener("click", function () {

            if (navigator.mediaDevices &&
                navigator.mediaDevices.getUserMedia) {

                navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment"
                    },
                    audio: false
                })
                .then(function (stream) {

                    let video = document.getElementById("cameraView");

                    if (!video) {
                        video = document.createElement("video");
                        video.id = "cameraView";
                        video.autoplay = true;
                        video.playsInline = true;

                        video.style.width = "100%";
                        video.style.height = "100%";
                        video.style.objectFit = "cover";
                        video.style.position = "fixed";
                        video.style.left = "0";
                        video.style.top = "0";
                        video.style.zIndex = "999";

                        document.body.appendChild(video);
                    }

                    video.srcObject = stream;

                })
                .catch(function (error) {
                    console.log("Erro ao abrir câmera:", error);
                    alert("Não foi possível abrir a câmera.");
                });

            } else {
                alert("Seu aparelho não suporta câmera pelo navegador.");
            }
        });
    }

    // Botões do menu
    const botoes = document.querySelectorAll(".menu-button");

    botoes.forEach(function (botao) {

        botao.addEventListener("click", function () {

            const nome = botao.getAttribute("data-name");

            if (nome) {
                console.log("Selecionado:", nome);
            }

        });

    });

});
