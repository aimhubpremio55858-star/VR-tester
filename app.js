// Componente customizado para registrar interações na cena
AFRAME.registerComponent('interactive-object', {
    init: function () {
        const el = this.el;

        // Evento ativado quando entra no modo XR
        this.el.sceneEl.addEventListener('enter-xr', () => {
            console.log("Modo Imersivo de Realidade Mista Ativado!");
        });

        // Altera a cor do objeto ao clicar ou interagir
        el.addEventListener('click', () => {
            el.setAttribute('color', '#ff0055');
            console.log("Objeto interativo acionado!");
        });
    }
});
