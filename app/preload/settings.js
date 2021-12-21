/* ---- MODULES ---- */
const { ipcRenderer } = require("electron");


/* ---- VARS ---- */
let eInUpdateCheck, eInUpdateAutoinstall;
let eInBehaviorAllowDrag;
let eInOutputForegroundColor, eInOutputForegroundOpacity, eInOutputBackgroundColor, eInOutputBackgroundOpacity;
let settings;


/* ---- INIT ---- */
window.addEventListener("DOMContentLoaded", () => {
    eInUpdateCheck = get("update-check");
    eInUpdateAutoinstall = get("update-autoinstall");
    eInBehaviorAllowDrag = get("behavior-allow-drag");
    eInOutputForegroundColor = get("output-foreground-color");
    eInOutputBackgroundColor = get("output-background-color");
    eInOutputForegroundOpacity = get("output-foreground-opacity");
    eInOutputBackgroundOpacity = get("output-background-opacity");
    
    handle(eInUpdateCheck, "change", () => setEnabled(eInUpdateAutoinstall, eInUpdateCheck.checked));
    setupColorInput(eInOutputForegroundColor);
    setupColorInput(eInOutputBackgroundColor);
    setupRangeInput(eInOutputForegroundOpacity);
    setupRangeInput(eInOutputBackgroundOpacity);
    handle(get("save"), "click", save);
    handle(get("cancel"), "click", cancel);

    readFromStorage();
});


/* ---- HANDLER & UTILITY FUNCTIONS ---- */
const get = (id) => document.getElementById(id);
const handle = (element, event, listener) => element.addEventListener(event, listener);

function save() {
    readFromInterface();
    writeToStorage();
    cancel();
}
const cancel = window.close;

async function readFromStorage() {
    settings = await ipcRenderer.invoke("settings:read");
    writeToInterface();
}

const writeToStorage = () => ipcRenderer.send("settings:write", settings);

function readFromInterface() {
    settings.updateCheck = eInUpdateCheck.checked;
    settings.updateAutoinstall = eInUpdateAutoinstall.checked;
    settings.behaviorAllowDrag = eInBehaviorAllowDrag.checked;
    settings.outputForegroundColor = eInOutputForegroundColor.value;
    settings.outputBackgroundColor = eInOutputBackgroundColor.value;
    settings.outputForegroundOpacity = parseInt(eInOutputForegroundOpacity.value);
    settings.outputBackgroundOpacity = parseInt(eInOutputBackgroundOpacity.value);
}

function writeToInterface() {
    eInUpdateCheck.checked = settings.updateCheck;
    eInUpdateAutoinstall.checked = settings.updateAutoinstall;
    setEnabled(eInUpdateAutoinstall, settings.updateCheck);
    eInBehaviorAllowDrag.checked = settings.behaviorAllowDrag;
    eInOutputForegroundColor.value = settings.outputForegroundColor;
    eInOutputBackgroundColor.value = settings.outputBackgroundColor;
    eInOutputForegroundOpacity.value = settings.outputForegroundOpacity;
    eInOutputBackgroundOpacity.value = settings.outputBackgroundOpacity;
    updateInputValueStyle(eInOutputForegroundColor.parentNode, eInOutputForegroundColor.value);
    updateInputValueStyle(eInOutputBackgroundColor.parentNode, eInOutputBackgroundColor.value);
    updateInputValueStyle(eInOutputForegroundOpacity.parentNode, eInOutputForegroundOpacity.value + "%");
    updateInputValueStyle(eInOutputBackgroundOpacity.parentNode, eInOutputBackgroundOpacity.value + "%");
}

const setEnabled = (element, enabled) => element.disabled = !enabled;

function updateInputValueStyle(element, value) {
    element.style.setProperty("--value", value);
    element.style.setProperty("--value-string", JSON.stringify(value));
}

const setupColorInput = (element) => handle(element, "input", () => updateInputValueStyle(element.parentNode, element.value));
const setupRangeInput = (element) => handle(element, "input", () => updateInputValueStyle(element.parentNode, element.value + "%"));
