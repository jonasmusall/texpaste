/* ---- MODULES ---- */
const { ipcRenderer } = require('electron')

/* ---- CONSTS, VARS ---- */
const MACRO_TABLE_TAB_INDEX = 3
let eInUpdateCheck, eInUpdateAutoinstall
let eInBehaviorAllowDrag
let eMacroTable
let selectedMacroIndex = -1
let eInBehaviorMacroNew, eInBehaviorMacroRemove
let eInOutputForegroundColor, eInOutputForegroundOpacity, eInOutputBackgroundColor, eInOutputBackgroundOpacity
let settings


/* ---- INIT ---- */
window.addEventListener('DOMContentLoaded', () => {
    eInUpdateCheck = get('update-check')
    eInUpdateAutoinstall = get('update-autoinstall')
    eInBehaviorAllowDrag = get('behavior-allow-drag')
    eInOutputForegroundColor = get('output-foreground-color')
    eInOutputBackgroundColor = get('output-background-color')
    eInOutputForegroundOpacity = get('output-foreground-opacity')
    eInOutputBackgroundOpacity = get('output-background-opacity')
    
    handle(eInUpdateCheck, 'change', () => setEnabled(eInUpdateAutoinstall, eInUpdateCheck.checked))
    setupColorInput(eInOutputForegroundColor)
    setupColorInput(eInOutputBackgroundColor)
    setupRangeInput(eInOutputForegroundOpacity)
    setupRangeInput(eInOutputBackgroundOpacity)
    setupMacroTable()
    handle(get('save'), 'click', save)
    handle(get('cancel'), 'click', cancel)

    readFromStorage()
})


/* ---- HANDLER & UTILITY FUNCTIONS ---- */
const get = (id) => document.getElementById(id)
const handle = (element, event, listener) => element.addEventListener(event, listener)

function save() {
    readFromInterface()
    writeToStorage()
    cancel()
}

function cancel() {
    window.close()
}

async function readFromStorage() {
    settings = await ipcRenderer.invoke('settings:read')
    writeToInterface()
}

function writeToStorage() {
    ipcRenderer.send('settings:write', settings)
}

function readFromInterface() {
    settings.updateCheck = eInUpdateCheck.checked
    settings.updateAutoinstall = eInUpdateAutoinstall.checked
    settings.behaviorAllowDrag = eInBehaviorAllowDrag.checked
    settings.behaviorMacros = {}
    Array.from(eMacroTable.rows).forEach(row => {
        let name = row.cells[0].children[0].value
        let def = row.cells[1].children[0].value
        if (name.length > 0 && def.length > 0) {
            settings.behaviorMacros[name] = def
        }
    })
    settings.outputForegroundColor = eInOutputForegroundColor.value
    settings.outputBackgroundColor = eInOutputBackgroundColor.value
    settings.outputForegroundOpacity = parseInt(eInOutputForegroundOpacity.value)
    settings.outputBackgroundOpacity = parseInt(eInOutputBackgroundOpacity.value)
}

function writeToInterface() {
    eInUpdateCheck.checked = settings.updateCheck
    eInUpdateAutoinstall.checked = settings.updateAutoinstall
    setEnabled(eInUpdateAutoinstall, settings.updateCheck)
    eInBehaviorAllowDrag.checked = settings.behaviorAllowDrag
    for (macro in settings.behaviorMacros) {
        appendMacro(macro, settings.behaviorMacros[macro], false)
    }
    if (eMacroTable.rows.length > 0) {
        selectMacro(0)
        setEnabled(eInBehaviorMacroRemove, true)
    }
    eInOutputForegroundColor.value = settings.outputForegroundColor
    eInOutputBackgroundColor.value = settings.outputBackgroundColor
    eInOutputForegroundOpacity.value = settings.outputForegroundOpacity
    eInOutputBackgroundOpacity.value = settings.outputBackgroundOpacity
    updateInputValueStyle(eInOutputForegroundColor.parentNode, eInOutputForegroundColor.value)
    updateInputValueStyle(eInOutputBackgroundColor.parentNode, eInOutputBackgroundColor.value)
    updateInputValueStyle(eInOutputForegroundOpacity.parentNode, eInOutputForegroundOpacity.value + '%')
    updateInputValueStyle(eInOutputBackgroundOpacity.parentNode, eInOutputBackgroundOpacity.value + '%')
}

function setEnabled(element, enabled) {
    element.disabled = !enabled
}

function updateInputValueStyle(element, value) {
    element.style.setProperty('--value', value)
    element.style.setProperty('--value-string', JSON.stringify(value))
}

function setupColorInput(element) {
    handle(element, 'input', () => updateInputValueStyle(element.parentNode, element.value))
}

function setupRangeInput(element) {
    handle(element, 'input', () => updateInputValueStyle(element.parentNode, element.value + '%'))
}

function setupMacroTable() {
    eMacroTable = get('macro-table')
    eInBehaviorMacroNew = get('macro-new')
    eInBehaviorMacroRemove = get('macro-remove')
    handle(eInBehaviorMacroNew, 'click', appendEmtpyMacro)
    handle(eInBehaviorMacroRemove, 'click', removeSelectedMacro)
}

function updateMacroTableTabIndices(tableTabIndex) {
    Array.from(eMacroTable.rows).forEach(row => {
        if (!row.classList.contains('selected')) {
            Array.from(row.cells).forEach(cell => {
                cell.children[0].tabIndex = -1
            })
        } else {
            Array.from(row.cells).forEach(cell => {
                cell.children[0].tabIndex = tableTabIndex
            })
        }
    })
}

function selectMacro(index) {
    if (selectedMacroIndex != -1) {
        eMacroTable.rows[selectedMacroIndex].classList.remove('selected')
    }
    selectedMacroIndex = index
    eMacroTable.rows[selectedMacroIndex].classList.add('selected')
    updateMacroTableTabIndices(MACRO_TABLE_TAB_INDEX)
}

function handleMacroInputKeyEvent(event, cellIndex) {
    if (event.key == 'ArrowUp') {
        if (selectedMacroIndex > 0) {
            selectMacro(selectedMacroIndex - 1)
            eMacroTable.rows[selectedMacroIndex].cells[cellIndex].children[0].focus()
        }
    } else if (event.key == 'ArrowDown') {
        if (selectedMacroIndex < eMacroTable.rows.length - 1) {
            selectMacro(selectedMacroIndex + 1)
            eMacroTable.rows[selectedMacroIndex].cells[cellIndex].children[0].focus()
        }
    }
}

function appendMacro(name, def, selectAndFocus) {
    let row = document.createElement('tr')
    let nameTd = document.createElement('td')
    let defTd = document.createElement('td')
    let nameInput = document.createElement('input')
    let defInput = document.createElement('input')
    nameInput.type = 'text'
    defInput.type = 'text'
    nameInput.spellcheck = false
    defInput.spellcheck = false
    if (name != null) {
        nameInput.value = name
    }
    if (def != null) {
        defInput.value = def
    }
    handle(nameInput, 'keyup', (event) => handleMacroInputKeyEvent(event, 0))
    handle(defInput, 'keyup', (event) => handleMacroInputKeyEvent(event, 1))
    let index = eMacroTable.rows.length
    handle(row, 'focusin', (event) => selectMacro(index))
    nameTd.appendChild(nameInput)
    defTd.appendChild(defInput)
    row.appendChild(nameTd)
    row.appendChild(defTd)
    eMacroTable.appendChild(row)
    if (selectAndFocus) {
        selectMacro(index)
        nameInput.focus()
    }
}

function appendEmtpyMacro() {
    if (selectedMacroIndex == -1) {
        setEnabled(eInBehaviorMacroRemove, true)
    }
    appendMacro(null, null, true)
}

function removeSelectedMacro() {
    if (selectedMacroIndex != -1) {
        eMacroTable.rows[selectedMacroIndex].remove()
        selectedMacroIndex--
        if (selectedMacroIndex == -1) {
            if (eMacroTable.rows.length > 0) {
                selectMacro(0)
            } else {
                if (eInBehaviorMacroRemove.matches(':focus')) {
                    eInBehaviorMacroNew.focus()
                }
                setEnabled(eInBehaviorMacroRemove, false)
            }
        } else {
            selectMacro(selectedMacroIndex)
        }
    }
}
