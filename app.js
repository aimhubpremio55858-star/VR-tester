/* =========================================
   VR BOX
   3DoF + Câmera + Hand Tracking
========================================= */


/* =========================
   ELEMENTOS
========================= */

const camera =
    document.getElementById("camera");

const panel =
    document.getElementById("panel");

const pointer =
    document.getElementById(
        "handPointer"
    );

const status =
    document.getElementById(
        "status"
    );

const handStatus =
    document.getElementById(
        "handStatus"
    );


/* =========================
   CÂMERA
========================= */

async function startCamera() {

    try {

        const stream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            "environment"

                    },

                    audio: false

                });


        camera.srcObject =
            stream;


        status.textContent =
            "3DoF • MR • ATIVO";


        handStatus.textContent =
            "✋ Câmera ativa";


    }

    catch(error) {

        console.error(error);

        status.textContent =
            "CÂMERA OFF";

        handStatus.textContent =
            "❌ Permissão da câmera necessária";

    }

}


/* =========================
   3DOF
========================= */

let yaw = 0;

let pitch = 0;

let roll = 0;


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


function update3DoF() {

    panel.style.transform = `

        translate(-50%,-50%)

        translateZ(-500px)

        rotateX(
            ${pitch * -0.08}deg
        )

        rotateY(
            ${yaw * 0.08}deg
        )

        rotateZ(
            ${roll * 0.04}deg
        )

    `;

}


/* =========================
   APPS
========================= */

function openApp(app) {

    const window =
        document.getElementById(
            "appWindow"
        );

    const frame =
        document.getElementById(
            "appFrame"
        );

    const title =
        document.getElementById(
            "appTitle"
        );


    window.classList.add(
        "active"
    );


    if(app === "youtube") {

        title.textContent =
            "▶️ YouTube";

        frame.src =
            "https://www.youtube.com/";

    }


    else if(app === "browser") {

        title.textContent =
            "🌐 Navegador";

        frame.src =
            "https://www.google.com/";

    }


    else if(app === "games") {

        title.textContent =
            "🎮 Jogos";

        frame.src =
            "about:blank";

        frame.srcdoc = `

            <html>

            <body style="
                margin:0;
                background:#050b18;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                height:100vh;
                font-family:Arial;
                text-align:center;
            ">

                <div>

                    <div style="
                        font-size:80px
                    ">
                        🎮
                    </div>

                    <h1>
                        Central de Jogos
                    </h1>

                    <p>
                        Seus jogos VR
                        aparecerão aqui.
                    </p>

                </div>

            </body>

            </html>

        `;

    }


    else if(app === "videos") {

        title.textContent =
            "🎬 Vídeos";

        frame.src =
            "about:blank";

    }


    else if(app === "music") {

        title.textContent =
            "🎵 Música";

        frame.src =
            "about:blank";

    }


    else if(app === "settings") {

        title.textContent =
            "⚙️ Configurações";

        frame.src =
            "about:blank";

    }

}


/* =========================
   FECHAR
========================= */

function closeApp() {

    document
        .getElementById(
            "appWindow"
        )
        .classList.remove(
            "active"
        );

}
