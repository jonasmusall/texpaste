const { ipcRenderer } = require("electron");
const katex = require("katex");

let output, background;

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

ipcRenderer.on("set-colors", (event, args) => {
    output.style.color = args.outputForegroundColor;
    output.style.opacity = args.outputForegroundOpacity / 100;
    background.style.backgroundColor = args.outputBackgroundColor;
    background.style.opacity = args.outputBackgroundOpacity / 100;
});

window.addEventListener("DOMContentLoaded", () => {
    output = document.getElementById("tex-output");
    background = document.getElementById("background");
    ipcRenderer.send("get-colors");
});
