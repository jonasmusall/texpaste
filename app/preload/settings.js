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
    settings.outputBackgroundColor = inputOutputBackgroundColor.value;
    settings.outputForegroundOpacity = parseInt(inputOutputForegroundOpacity.value);
    settings.outputBackgroundOpacity = parseInt(inputOutputBackgroundOpacity.value);
}

function writeToInterface() {
    inputUpdateCheck.checked = settings.updateCheck;
    inputUpdateAutoinstall.checked = settings.updateAutoinstall;
    setEnabled(inputUpdateAutoinstall, settings.updateCheck);
    inputOutputForegroundColor.value = settings.outputForegroundColor;
    inputOutputBackgroundColor.value = settings.outputBackgroundColor;
    inputOutputForegroundOpacity.value = settings.outputForegroundOpacity;
    inputOutputBackgroundOpacity.value = settings.outputBackgroundOpacity;
    updateInputValueStyle(inputOutputForegroundColor.parentNode, inputOutputForegroundColor.value);
    updateInputValueStyle(inputOutputBackgroundColor.parentNode, inputOutputBackgroundColor.value);
    updateInputValueStyle(inputOutputForegroundOpacity.parentNode, inputOutputForegroundOpacity.value + "%");
    updateInputValueStyle(inputOutputBackgroundOpacity.parentNode, inputOutputBackgroundOpacity.value + "%");
}

function setEnabled(element, enabled) {
    element.disabled = !enabled;
}

function updateInputValueStyle(element, value) {
    element.style.setProperty("--value", value);
    element.style.setProperty("--value-string", JSON.stringify(value));
}

function setupColorInput(element) {
    console.log(element);
    element.addEventListener("input", () => updateInputValueStyle(element.parentNode, element.value));
}

function setupRangeInput(element) {
    element.addEventListener("input", () => updateInputValueStyle(element.parentNode, element.value + "%"));
}

window.addEventListener("DOMContentLoaded", () => {
    //get input elements
    inputUpdateCheck = document.getElementById("update-check");
    inputUpdateAutoinstall = document.getElementById("update-autoinstall");
    inputOutputForegroundColor = document.getElementById("output-foreground-color");
    inputOutputBackgroundColor = document.getElementById("output-background-color");
    inputOutputForegroundOpacity = document.getElementById("output-foreground-opacity");
    inputOutputBackgroundOpacity = document.getElementById("output-background-opacity");
    //write values from storage
    writeToInterface();
    //set up input events
    inputUpdateCheck.addEventListener("change", () => setEnabled(inputUpdateAutoinstall, inputUpdateCheck.checked));
    setupColorInput(inputOutputForegroundColor);
    setupColorInput(inputOutputBackgroundColor);
    setupRangeInput(inputOutputForegroundOpacity);
    setupRangeInput(inputOutputBackgroundOpacity);
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("cancel").addEventListener("click", close);
});
