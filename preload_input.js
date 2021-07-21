const { ipcRenderer } = require("electron");
const katex = require("katex");

let input, output;

function sizeChanged() {
    ipcRenderer.send("size", {
        width: output.offsetWidth,
        height: output.offsetHeight
    });
}

function updateTex() {
    ipcRenderer.send("tex", input.value);
    katex.render(
        input.value,
        output,
        {
            displayMode: true,
            output: "html",
            throwOnError: false,
            strict: "ignore"
        }
    )
}

function accept() {
    navigator.clipboard.writeText(input.value).then(
        () => window.close(),
        () => window.close()
    )
}

function cancel() {
    window.close();
}

function handleKeyUp(event) {
    if (event.key == "Enter") {
        accept();
    } else if (event.key == "Escape") {
        cancel();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    input = document.getElementById("tex-input");
    output = document.getElementById("tex-output");
    input.addEventListener("input", updateTex);
    input.addEventListener("keyup", handleKeyUp);
    document.getElementById("accept").addEventListener("click", accept);
    document.getElementById("cancel").addEventListener("click", cancel);
    new ResizeObserver(sizeChanged).observe(output);
    document.body.addEventListener("click", () => input.focus());
    input.focus();
});
