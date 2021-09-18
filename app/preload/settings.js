const { ipcRenderer } = require("electron");

let settings;
let inputUpdateCheck, inputUpdateAutoinstall;

readFromStorage();

function close() {
    window.close();
}

function save() {
    readFromInterface();
    writeToStorage();
    close();
}

function readFromStorage() {
    ipcRenderer.invoke("read-settings").then((result) => {
        settings = result;
    });
}

function writeToStorage() {
    ipcRenderer.send("write-settings", settings);
}

function readFromInterface() {
    settings.updateCheck = inputUpdateCheck.checked;
    settings.updateAutoinstall = inputUpdateAutoinstall.checked;
}

function writeToInterface() {
    inputUpdateCheck.checked = settings.updateCheck;
    inputUpdateAutoinstall.checked = settings.updateAutoinstall;
    setEnabled(inputUpdateAutoinstall, settings.updateCheck);
}

function setEnabled(element, enabled) {
    element.disabled = !enabled;
}

window.addEventListener("DOMContentLoaded", () => {
    inputUpdateCheck = document.getElementById("update-check");
    inputUpdateAutoinstall = document.getElementById("update-autoinstall");
    writeToInterface();
    inputUpdateCheck.addEventListener("change", (event) => { setEnabled(inputUpdateAutoinstall, inputUpdateCheck.checked) });
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("cancel").addEventListener("click", close);
});
