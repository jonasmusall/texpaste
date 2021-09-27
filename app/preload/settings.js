const { ipcRenderer } = require("electron");

let settings;
let inputUpdateCheck, inputUpdateAutoinstall, inputOutputForegroundColor, inputOutputForegroundOpacity, inputOutputBackgroundColor, inputOutputBackgroundOpacity;

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
    settings.outputForegroundColor = inputOutputForegroundColor.value;
    settings.outputForegroundOpacity = parseInt(inputOutputForegroundOpacity.value);
    settings.outputBackgroundColor = inputOutputBackgroundColor.value;
    settings.outputBackgroundOpacity = parseInt(inputOutputBackgroundOpacity.value);
}

function writeToInterface() {
    inputUpdateCheck.checked = settings.updateCheck;
    inputUpdateAutoinstall.checked = settings.updateAutoinstall;
    setEnabled(inputUpdateAutoinstall, settings.updateCheck);
    inputOutputForegroundColor.value = settings.outputForegroundColor;
    inputOutputForegroundOpacity.value = settings.outputForegroundOpacity;
    inputOutputBackgroundColor.value = settings.outputBackgroundColor;
    inputOutputBackgroundOpacity.value = settings.outputBackgroundOpacity;
    updateInputValueStyle(inputOutputForegroundColor.parentNode, inputOutputForegroundColor.value);
    updateInputValueStringStyle(inputOutputForegroundOpacity, inputOutputForegroundOpacity.value + "%");
    updateInputValueStyle(inputOutputBackgroundColor.parentNode, inputOutputBackgroundColor.value);
    updateInputValueStringStyle(inputOutputBackgroundOpacity, inputOutputBackgroundOpacity.value + "%");
}

function setEnabled(element, enabled) {
    element.disabled = !enabled;
}

function updateInputValueStyle(element, value) {
    element.style.setProperty("--value", value);
}

function updateInputValueStringStyle(element, value) {
    updateInputValueStyle(element, value);
    element.style.setProperty("--value-string", JSON.stringify(value));
}

function setupColorInput(element) {
    element.addEventListener("input", (event) => updateInputValueStyle(element.parentNode, element.value));
}

function setupSlider(element) {
    element.addEventListener("input", (event) => updateInputValueStringStyle(element, element.value + "%"));
}

window.addEventListener("DOMContentLoaded", () => {
    inputUpdateCheck = document.getElementById("update-check");
    inputUpdateAutoinstall = document.getElementById("update-autoinstall");
    inputOutputForegroundColor = document.getElementById("output-foreground-color");
    inputOutputForegroundOpacity = document.getElementById("output-foreground-opacity");
    inputOutputBackgroundColor = document.getElementById("output-background-color");
    inputOutputBackgroundOpacity = document.getElementById("output-background-opacity");
    writeToInterface();
    inputUpdateCheck.addEventListener("change", (event) => { setEnabled(inputUpdateAutoinstall, inputUpdateCheck.checked) });
    setupColorInput(inputOutputForegroundColor);
    setupSlider(inputOutputForegroundOpacity);
    setupColorInput(inputOutputBackgroundColor);
    setupSlider(inputOutputBackgroundOpacity);
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("cancel").addEventListener("click", close);
});
