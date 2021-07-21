const { ipcRenderer } = require("electron");

let input, output;

function sizeChanged() {
    ipcRenderer.send("size", {
        width: output.offsetWidth,
        height: output.offsetHeight
    });
}

function updateTex() {
    ipcRenderer.send("tex", input.value);
}

window.addEventListener("DOMContentLoaded", () => {
    input = document.getElementById("tex-input");
    output = document.getElementById("tex-output");
    input.addEventListener("input", updateTex);
    new ResizeObserver(sizeChanged).observe(output);
});
