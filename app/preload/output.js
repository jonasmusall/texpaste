const { ipcRenderer } = require("electron");
const katex = require("katex");

let output;

ipcRenderer.on("tex", (event, args) => {
    katex.render(
        args,
        output,
        {
            displayMode: true,
            output: "html",
            throwOnError: false,
            strict: "ignore"
        }
    );
});

window.addEventListener("DOMContentLoaded", () => {
    output = document.getElementById("tex-output");
});
