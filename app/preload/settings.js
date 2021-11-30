const { ipcRenderer } = require("electron");

const MACRO_TABLE_TAB_INDEX = 3;

let settings;
let inputUpdateCheck, inputUpdateAutoinstall, inputBehaviorAllowDrag, inputBehaviorMacroNew, inputBehaviorMacroRemove, inputOutputForegroundColor, inputOutputForegroundOpacity, inputOutputBackgroundColor, inputOutputBackgroundOpacity;
let macroTable;
let selectedMacroIndex = -1;

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
    settings.behaviorAllowDrag = inputBehaviorAllowDrag.checked;
    settings.behaviorMacros = {};
    Array.from(macroTable.rows).forEach(row => {
        let name = row.cells[0].children[0].value;
        let def = row.cells[1].children[0].value;
        if (name.length > 0 && def.length > 0) {
            settings.behaviorMacros[name] = def;
        }
    });
    settings.outputForegroundColor = inputOutputForegroundColor.value;
    settings.outputBackgroundColor = inputOutputBackgroundColor.value;
    settings.outputForegroundOpacity = parseInt(inputOutputForegroundOpacity.value);
    settings.outputBackgroundOpacity = parseInt(inputOutputBackgroundOpacity.value);
}

function writeToInterface() {
    inputUpdateCheck.checked = settings.updateCheck;
    inputUpdateAutoinstall.checked = settings.updateAutoinstall;
    setEnabled(inputUpdateAutoinstall, settings.updateCheck);
    inputBehaviorAllowDrag.checked = settings.behaviorAllowDrag;
    for (macro in settings.behaviorMacros) {
        appendMacro(macro, settings.behaviorMacros[macro], false);
    }
    if (macroTable.rows.length > 0) {
        selectMacro(0);
        setEnabled(inputBehaviorMacroRemove, true);
    }
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

function updateMacroTableTabIndices(tableTabIndex) {
    Array.from(macroTable.rows).forEach(row => {
        if (!row.classList.contains("selected")) {
            Array.from(row.cells).forEach(cell => {
                cell.children[0].tabIndex = -1;
            });
        } else {
            Array.from(row.cells).forEach(cell => {
                cell.children[0].tabIndex = tableTabIndex;
            });
        }
    });
}

function selectMacro(index) {
    if (selectedMacroIndex != -1) {
        macroTable.rows[selectedMacroIndex].classList.remove("selected");
    }
    selectedMacroIndex = index;
    macroTable.rows[selectedMacroIndex].classList.add("selected");
    updateMacroTableTabIndices(MACRO_TABLE_TAB_INDEX);
}

function handleMacroInputKeyEvent(event, cellIndex) {
    if (event.key == "ArrowUp") {
        if (selectedMacroIndex > 0) {
            selectMacro(selectedMacroIndex - 1);
            macroTable.rows[selectedMacroIndex].cells[cellIndex].children[0].focus();
        }
    } else if (event.key == "ArrowDown") {
        if (selectedMacroIndex < macroTable.rows.length - 1) {
            selectMacro(selectedMacroIndex + 1);
            macroTable.rows[selectedMacroIndex].cells[cellIndex].children[0].focus();
        }
    }
}

function appendMacro(name, def, selectAndFocus) {
    let row = document.createElement("tr");
    let nameTd = document.createElement("td");
    let defTd = document.createElement("td");
    let nameInput = document.createElement("input");
    let defInput = document.createElement("input");
    nameInput.type = "text";
    defInput.type = "text";
    nameInput.spellcheck = false;
    defInput.spellcheck = false;
    if (name != null) {
        nameInput.value = name;
    }
    if (def != null) {
        defInput.value = def;
    }
    nameInput.addEventListener("keyup", (event) => handleMacroInputKeyEvent(event, 0));
    defInput.addEventListener("keyup", (event) => handleMacroInputKeyEvent(event, 1));
    let index = macroTable.rows.length;
    row.addEventListener("focusin", (event) => {
        selectMacro(index);
    });
    nameTd.appendChild(nameInput);
    defTd.appendChild(defInput);
    row.appendChild(nameTd);
    row.appendChild(defTd);
    macroTable.appendChild(row);
    if (selectAndFocus) {
        selectMacro(index);
        nameInput.focus();
    }
}

function appendEmtpyMacro() {
    if (selectedMacroIndex == -1) {
        setEnabled(inputBehaviorMacroRemove, true);
    }
    appendMacro(null, null, true);
}

function removeSelectedMacro() {
    if (selectedMacroIndex != -1) {
        macroTable.rows[selectedMacroIndex].remove();
        selectedMacroIndex--;
        if (selectedMacroIndex == -1) {
            if (macroTable.rows.length > 0) {
                selectMacro(0);
            } else {
                if (inputBehaviorMacroRemove.matches(":focus")) {
                    inputBehaviorMacroNew.focus();
                }
                setEnabled(inputBehaviorMacroRemove, false);
            }
        } else {
            selectMacro(selectedMacroIndex);
        }
    }
}

function setupMacroTable() {
    macroTable = document.getElementById("macro-table");
    inputBehaviorMacroNew = document.getElementById("macro-new");
    inputBehaviorMacroRemove = document.getElementById("macro-remove");
    inputBehaviorMacroNew.addEventListener("click", appendEmtpyMacro);
    inputBehaviorMacroRemove.addEventListener("click", removeSelectedMacro);
}

window.addEventListener("DOMContentLoaded", () => {
    //get input elements
    inputUpdateCheck = document.getElementById("update-check");
    inputUpdateAutoinstall = document.getElementById("update-autoinstall");
    inputBehaviorAllowDrag = document.getElementById("behavior-allow-drag");
    inputOutputForegroundColor = document.getElementById("output-foreground-color");
    inputOutputBackgroundColor = document.getElementById("output-background-color");
    inputOutputForegroundOpacity = document.getElementById("output-foreground-opacity");
    inputOutputBackgroundOpacity = document.getElementById("output-background-opacity");
    //set up input events
    inputUpdateCheck.addEventListener("change", () => setEnabled(inputUpdateAutoinstall, inputUpdateCheck.checked));
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("cancel").addEventListener("click", close);
    setupColorInput(inputOutputForegroundColor);
    setupColorInput(inputOutputBackgroundColor);
    setupRangeInput(inputOutputForegroundOpacity);
    setupRangeInput(inputOutputBackgroundOpacity);
    setupMacroTable();
    //write values from storage
    writeToInterface();
});
