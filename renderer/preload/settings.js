/* ---- MODULES ---- */
const { ipcRenderer } = require('electron');

/* ---- CONSTS, VARS ---- */
const MACRO_TABLE_TAB_INDEX = 4;
let eInUpdateCheck, eInUpdateAutoinstall;
let eInBehaviorAllowDrag, eInBehaviorCloseOnAccept;
let eMacroTable;
let selectedMacroIndex = -1;
let eInBehaviorMacroNew, eInBehaviorMacroRemove;
let eInOutputForegroundColor, eInOutputForegroundOpacity, eInOutputBackgroundColor, eInOutputBackgroundOpacity;
let settings;
let selfUpdate;


/* ---- INIT ---- */
handle(window, 'DOMContentLoaded', async () => {
    eInUpdateCheck = get('update-check');
    eInUpdateAutoinstall = get('update-autoinstall');
    eInBehaviorAllowDrag = get('behavior-allow-drag');
    eInBehaviorCloseOnAccept = get('behavior-close-on-accept');
    eInOutputForegroundColor = get('output-foreground-color');
    eInOutputBackgroundColor = get('output-background-color');
    eInOutputForegroundOpacity = get('output-foreground-opacity');
    eInOutputBackgroundOpacity = get('output-background-opacity');
    
    handle(eInUpdateCheck, 'change', () => setEnabled(eInUpdateAutoinstall, selfUpdate && eInUpdateCheck.checked));
    setupColorInput(eInOutputForegroundColor);
    setupColorInput(eInOutputBackgroundColor);
    setupRangeInput(eInOutputForegroundOpacity);
    setupRangeInput(eInOutputBackgroundOpacity);
    setupMacroTable();
    handle(get('save'), 'click', save);
    handle(get('cancel'), 'click', cancel);

    readFromStorage();
    get('version').innerHTML = await ipcRenderer.invoke('get-version');
    handle(get('github-icon'), 'click', () => ipcRenderer.send('open-repos'));
});


/* ---- HANDLER & UTILITY FUNCTIONS ---- */
function get(id) { return document.getElementById(id); }
function handle(element, event, listener) { element.addEventListener(event, listener); }
function map(collection, func) { Array.from(collection).forEach(func); }

function save() {
    readFromInterface();
    writeToStorage();
    cancel();
}

function cancel() {
    window.close();
}

async function readFromStorage() {
    const fromMain = await ipcRenderer.invoke('settings:read');
    settings = fromMain.settings;
    selfUpdate = fromMain.selfUpdate;
    writeToInterface();
}

function writeToStorage() {
    ipcRenderer.send('settings:write', settings);
}

function readFromInterface() {
    settings.updateCheck = eInUpdateCheck.checked;
    settings.updateAutoinstall = eInUpdateAutoinstall.checked;
    settings.behaviorAllowDrag = eInBehaviorAllowDrag.checked;
    settings.behaviorCloseOnAccept = eInBehaviorCloseOnAccept.checked;
    settings.behaviorMacros = {};
    map(eMacroTable.rows, row => {
        let name = row.cells[0].children[0].value;
        let def = row.cells[1].children[0].value;
        if (name.length > 0 && def.length > 0) {
            settings.behaviorMacros[name] = def;
        }
    });
    settings.outputForegroundColor = eInOutputForegroundColor.value;
    settings.outputBackgroundColor = eInOutputBackgroundColor.value;
    settings.outputForegroundOpacity = parseInt(eInOutputForegroundOpacity.value);
    settings.outputBackgroundOpacity = parseInt(eInOutputBackgroundOpacity.value);
}

function writeToInterface() {
    eInUpdateCheck.checked = settings.updateCheck;
    eInUpdateAutoinstall.checked = settings.updateAutoinstall;
    setEnabled(eInUpdateAutoinstall, selfUpdate && settings.updateCheck);
    if (!selfUpdate) {
        get('update-autoinstall-annotation').classList.remove('hidden');
    }
    eInBehaviorAllowDrag.checked = settings.behaviorAllowDrag;
    eInBehaviorCloseOnAccept.checked = settings.behaviorCloseOnAccept;
    for (macro in settings.behaviorMacros) {
        appendMacro(macro, settings.behaviorMacros[macro], false);
    }
    if (eMacroTable.rows.length > 0) {
        selectMacro(0);
        setEnabled(eInBehaviorMacroRemove, true);
    }
    eInOutputForegroundColor.value = settings.outputForegroundColor;
    eInOutputBackgroundColor.value = settings.outputBackgroundColor;
    eInOutputForegroundOpacity.value = settings.outputForegroundOpacity;
    eInOutputBackgroundOpacity.value = settings.outputBackgroundOpacity;
    updateInputValueStyle(eInOutputForegroundColor.parentNode, eInOutputForegroundColor.value);
    updateInputValueStyle(eInOutputBackgroundColor.parentNode, eInOutputBackgroundColor.value);
    updateInputValueStyle(eInOutputForegroundOpacity.parentNode, eInOutputForegroundOpacity.value + '%');
    updateInputValueStyle(eInOutputBackgroundOpacity.parentNode, eInOutputBackgroundOpacity.value + '%');
}

function setEnabled(element, enabled) {
    element.disabled = !enabled;
}

function updateInputValueStyle(element, value) {
    element.style.setProperty('--value', value);
    element.style.setProperty('--value-string', JSON.stringify(value));
}

function setupColorInput(element) {
    handle(element, 'input', () => updateInputValueStyle(element.parentNode, element.value));
}

function setupRangeInput(element) {
    handle(element, 'input', () => updateInputValueStyle(element.parentNode, element.value + '%'));
}

function setupMacroTable() {
    eMacroTable = get('macro-table');
    eInBehaviorMacroNew = get('macro-new');
    eInBehaviorMacroRemove = get('macro-remove');
    handle(eInBehaviorMacroNew, 'click', appendEmtpyMacro);
    handle(eInBehaviorMacroRemove, 'click', removeSelectedMacro);
}

function selectMacro(index) {
    if (selectedMacroIndex != -1) {
        eMacroTable.rows[selectedMacroIndex].classList.remove('selected');
    }
    selectedMacroIndex = index;
    eMacroTable.rows[selectedMacroIndex].classList.add('selected');
    map(eMacroTable.rows, row => {
        if (!row.classList.contains('selected')) {
            map(row.cells, cell => {
                cell.children[0].tabIndex = -1;
            });
        } else {
            map(row.cells, cell => {
                cell.children[0].tabIndex = MACRO_TABLE_TAB_INDEX;
            });
        }
    });
}

function handleMacroInputKeyEvent(event, cellIndex) {
    if (event.key == 'ArrowUp') {
        if (selectedMacroIndex > 0) {
            selectMacro(selectedMacroIndex - 1);
            eMacroTable.rows[selectedMacroIndex].cells[cellIndex].children[0].focus();
        }
    } else if (event.key == 'ArrowDown') {
        if (selectedMacroIndex < eMacroTable.rows.length - 1) {
            selectMacro(selectedMacroIndex + 1);
            eMacroTable.rows[selectedMacroIndex].cells[cellIndex].children[0].focus();
        }
    }
}

function appendMacro(name, def, selectAndFocus) {
    let row = document.createElement('tr');
    let nameTd = document.createElement('td');
    let defTd = document.createElement('td');
    let nameInput = document.createElement('input');
    let defInput = document.createElement('input');
    nameInput.type = 'text';
    defInput.type = 'text';
    nameInput.spellcheck = false;
    defInput.spellcheck = false;
    if (name != null) {
        nameInput.value = name;
    }
    if (def != null) {
        defInput.value = def;
    }
    handle(nameInput, 'keyup', (event) => handleMacroInputKeyEvent(event, 0));
    handle(defInput, 'keyup', (event) => handleMacroInputKeyEvent(event, 1));
    let index = eMacroTable.rows.length;
    handle(row, 'focusin', (event) => selectMacro(index));
    nameTd.appendChild(nameInput);
    defTd.appendChild(defInput);
    row.appendChild(nameTd);
    row.appendChild(defTd);
    eMacroTable.appendChild(row);
    if (selectAndFocus) {
        selectMacro(index);
        nameInput.focus();
    }
}

function appendEmtpyMacro() {
    if (selectedMacroIndex == -1) {
        setEnabled(eInBehaviorMacroRemove, true);
    }
    appendMacro(null, null, true);
}

function removeSelectedMacro() {
    if (selectedMacroIndex != -1) {
        eMacroTable.rows[selectedMacroIndex].remove();
        selectedMacroIndex--;
        if (selectedMacroIndex == -1) {
            if (eMacroTable.rows.length > 0) {
                selectMacro(0);
            } else {
                if (eInBehaviorMacroRemove.matches(':focus')) {
                    eInBehaviorMacroNew.focus();
                }
                setEnabled(eInBehaviorMacroRemove, false);
            }
        } else {
            selectMacro(selectedMacroIndex);
        }
    }
}
