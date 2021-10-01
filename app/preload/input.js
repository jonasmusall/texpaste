const { ipcRenderer } = require("electron");
const katex = require("katex");

let input, output;
let nextVersion;

ipcRenderer.on("update-notify", (event, args) => {
    nextVersion = args.nextVersion;
    showUpdateBanner("A new version (" + nextVersion + ") is available, would you like to install it when closing the app?");
});

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

function openSettings() {
    ipcRenderer.send("open-settings");
}

function checkForUpdate() {
    ipcRenderer.send("update-check");
}

function installUpdate() {
    ipcRenderer.send("update-install");
    hideUpdateBanner();
}

function skipUpdate() {
    ipcRenderer.send("update-skip", { nextVersion: nextVersion });
    hideUpdateBanner();
}

function showUpdateBanner(text) {
    document.getElementById("banner-text").innerHTML = text;
    document.getElementById("banner-yes").tabIndex = 0;
    document.getElementById("banner-skip").tabIndex = 1;
    document.getElementById("banner").classList.add("show");
}

function hideUpdateBanner() {
    document.getElementById("banner-yes").tabIndex = -1;
    document.getElementById("banner-skip").tabIndex = -1;
    document.getElementById("banner").classList.remove("show");
    input.focus();
}

function accept() {
    ipcRenderer.send("accept");
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
    //get elements
    input = document.getElementById("tex-input");
    output = document.getElementById("tex-output");
    //set up event listeners
    input.addEventListener("input", updateTex);
    input.addEventListener("keyup", handleKeyUp);
    document.getElementById("settings").addEventListener("click", openSettings);
    document.getElementById("accept").addEventListener("click", accept);
    document.getElementById("cancel").addEventListener("click", cancel);
    document.getElementById("banner-yes").addEventListener("click", installUpdate);
    document.getElementById("banner-skip").addEventListener("click", skipUpdate);
    new ResizeObserver(sizeChanged).observe(output);
    
    input.focus();
    checkForUpdate();
});
