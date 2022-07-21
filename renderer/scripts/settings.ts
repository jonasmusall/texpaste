import { id, listen, forEach } from './lib/util.js';
declare const settingsWindowApi: SettingsWindowContextBridgeApi;


const MACRO_TABLE_TAB_INDEX = 4;
const updateCheck = id('update-check') as HTMLInputElement;
const updateAutoinstall = id('update-autoinstall') as HTMLInputElement;
const behaviorAllowDrag = id('behavior-allow-drag') as HTMLInputElement;
const behaviorCloseOnAccept = id('behavior-close-on-accept') as HTMLInputElement;
const macroTable = id('macro-table') as HTMLTableElement;
const macroNew = id('macro-new') as HTMLButtonElement;
const macroRemove = id('macro-remove') as HTMLButtonElement;
const outputForegroundColor = id('output-foreground-color') as HTMLInputElement;
const outputForegroundOpacity = id('output-foreground-opacity') as HTMLInputElement;
const outputBackgroundColor = id('output-background-color') as HTMLInputElement;
const outputBackgroundOpacity = id('output-background-opacity') as HTMLInputElement;
let selectedMacroIndex = -1;
let settings: any;
let selfUpdate = false;

    
listen(updateCheck, 'change', () => setEnabled(updateAutoinstall, selfUpdate && updateCheck.checked));
setupColorInput(outputForegroundColor);
setupColorInput(outputBackgroundColor);
setupRangeInput(outputForegroundOpacity);
setupRangeInput(outputBackgroundOpacity);
listen(macroNew, 'click', appendEmtpyMacro);
listen(macroRemove, 'click', removeSelectedMacro);
listen(id('save')!, 'click', save);
listen(id('cancel')!, 'click', cancel);

readFromStorage();
id('version')!.innerHTML = await settingsWindowApi.getAppVersion();
listen(id('github-icon')!, 'click', settingsWindowApi.openRepository);


function save() {
  readFromInterface();
  writeToStorage();
  cancel();
}

function cancel() {
  window.close();
}

async function readFromStorage() {
  const fromMain = await settingsWindowApi.readSettings();
  settings = fromMain.settings;
  selfUpdate = fromMain.selfUpdate;
  writeToInterface();
}

function writeToStorage() {
  settingsWindowApi.writeSettings(settings);
}

function readFromInterface() {
  settings.updateCheck = updateCheck.checked;
  settings.updateAutoinstall = updateAutoinstall.checked;
  settings.behaviorAllowDrag = behaviorAllowDrag.checked;
  settings.behaviorCloseOnAccept = behaviorCloseOnAccept.checked;
  settings.behaviorMacros = {};
  forEach(macroTable.rows, row => {
    let name = (row.cells[0].children[0] as HTMLInputElement).value;
    let def = (row.cells[1].children[0] as HTMLInputElement).value;
    if (name.length > 0 && def.length > 0) {
      settings.behaviorMacros[name] = def;
    }
  });
  settings.outputForegroundColor = outputForegroundColor.value;
  settings.outputBackgroundColor = outputBackgroundColor.value;
  settings.outputForegroundOpacity = parseInt(outputForegroundOpacity.value);
  settings.outputBackgroundOpacity = parseInt(outputBackgroundOpacity.value);
}

function writeToInterface() {
  updateCheck.checked = settings.updateCheck;
  updateAutoinstall.checked = settings.updateAutoinstall;
  setEnabled(updateAutoinstall, selfUpdate && settings.updateCheck);
  if (!selfUpdate) {
    id('update-autoinstall-annotation')!.classList.remove('hidden');
  }
  behaviorAllowDrag.checked = settings.behaviorAllowDrag;
  behaviorCloseOnAccept.checked = settings.behaviorCloseOnAccept;
  for (const macro in settings.behaviorMacros) {
    appendMacro(macro, settings.behaviorMacros[macro], false);
  }
  if (macroTable.rows.length > 0) {
    selectMacro(0);
    setEnabled(macroRemove, true);
  }
  outputForegroundColor.value = settings.outputForegroundColor;
  outputBackgroundColor.value = settings.outputBackgroundColor;
  outputForegroundOpacity.value = settings.outputForegroundOpacity;
  outputBackgroundOpacity.value = settings.outputBackgroundOpacity;
  updateInputValueStyle(outputForegroundColor.parentNode as HTMLLabelElement, outputForegroundColor.value);
  updateInputValueStyle(outputBackgroundColor.parentNode as HTMLLabelElement, outputBackgroundColor.value);
  updateInputValueStyle(outputForegroundOpacity.parentNode as HTMLLabelElement, outputForegroundOpacity.value + '%');
  updateInputValueStyle(outputBackgroundOpacity.parentNode as HTMLLabelElement, outputBackgroundOpacity.value + '%');
}

function setEnabled(element: HTMLInputElement | HTMLButtonElement, enabled: boolean) {
  element.disabled = !enabled;
}

function updateInputValueStyle(element: HTMLElement, value: string) {
  element.style.setProperty('--value', value);
  element.style.setProperty('--value-string', JSON.stringify(value));
}

function setupColorInput(element: HTMLInputElement) {
  listen(element, 'input', () => updateInputValueStyle(element.parentNode as HTMLLabelElement, element.value));
}

function setupRangeInput(element: HTMLInputElement) {
  listen(element, 'input', () => updateInputValueStyle(element.parentNode as HTMLLabelElement, element.value + '%'));
}

function selectMacro(index: number) {
  if (selectedMacroIndex != -1) {
    macroTable.rows[selectedMacroIndex].classList.remove('selected');
  }
  selectedMacroIndex = index;
  macroTable.rows[selectedMacroIndex].classList.add('selected');
  forEach(macroTable.rows, row => {
    if (!row.classList.contains('selected')) {
      forEach(row.cells, cell => {
        (cell.children[0] as HTMLInputElement).tabIndex = -1;
      });
    } else {
      forEach(row.cells, cell => {
        (cell.children[0] as HTMLInputElement).tabIndex = MACRO_TABLE_TAB_INDEX;
      });
    }
  });
}

function handleMacroInputKeyEvent(event: KeyboardEvent, cellIndex: number) {
  if (event.key == 'ArrowUp') {
    if (selectedMacroIndex > 0) {
      selectMacro(selectedMacroIndex - 1);
      (macroTable.rows[selectedMacroIndex].cells[cellIndex].children[0] as HTMLInputElement).focus();
    }
  } else if (event.key == 'ArrowDown') {
    if (selectedMacroIndex < macroTable.rows.length - 1) {
      selectMacro(selectedMacroIndex + 1);
      (macroTable.rows[selectedMacroIndex].cells[cellIndex].children[0] as HTMLInputElement).focus();
    }
  }
}

function appendMacro(name: string | null, def: string | null, selectAndFocus: boolean) {
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
  listen(nameInput, 'keyup', (event) => handleMacroInputKeyEvent(event, 0));
  listen(defInput, 'keyup', (event) => handleMacroInputKeyEvent(event, 1));
  let index = macroTable.rows.length;
  listen(row, 'focusin', (event) => selectMacro(index));
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
    setEnabled(macroRemove, true);
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
        if (macroRemove.matches(':focus')) {
          macroNew.focus();
        }
        setEnabled(macroRemove, false);
      }
    } else {
      selectMacro(selectedMacroIndex);
    }
  }
}
