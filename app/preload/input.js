console.time('preload');
/* ---- MODULES ---- */
const { ipcRenderer } = require('electron');
const katex = require('katex');


/* ---- VARS ---- */
let eInput, eOutput;
let nextVersion;
let macros = {};


/* ---- IPC ---- */
ipcRenderer.on('settings', (event, args) => applySettings(args));
ipcRenderer.on('update-notify', (event, args) => handleUpdateAvailable(args.nextVersion));


/* ---- INIT ---- */
window.addEventListener('DOMContentLoaded', () => {
    eInput = document.getElementById('tex-input');
    eOutput = document.getElementById('tex-output');

    handle(eInput, 'input', updateTex);
    handle(eInput, 'keyup', handleInputKeyUp);
    handle(get('accept'), 'click', accept);
    handle(get('cancel'), 'click', cancel);
    handle(get('settings'), 'click', () => ipcRenderer.send('input:open-settings'));
    handle(get('banner-yes'), 'click', installUpdate);
    handle(get('banner-skip'), 'click', skipUpdate);
    handle(window, 'focus', () => eInput.focus());
    
    ipcRenderer.send('input:ready');
});


/* ---- HANDLER & UTILITY FUNCTIONS ---- */
const get = (id) => document.getElementById(id);
const handle = (element, event, listener) => element.addEventListener(event, listener);

function accept() {
    ipcRenderer.send('input:accept');
}

function cancel() {
    window.close();
}

function updateTex() {
    ipcRenderer.send('input:tex', eInput.value);
    katex.render(
        eInput.value,
        eOutput,
        {
            displayMode: true,
            output: 'html',
            throwOnError: false,
            strict: 'ignore',
            macros: macros
        }
    );
}

function handleInputKeyUp(event) {
    if (event.key == 'Enter') {
        accept();
    } else if (event.key == 'Escape') {
        cancel();
    }
}

function applySettings(settings) {
    if (settings.behaviorAllowDrag) {
        document.body.classList.add('draggable');
    } else {
        document.body.classList.remove('draggable');
    }
    macros = settings.behaviorMacros;
    updateTex();
}

function handleUpdateAvailable(version) {
    nextVersion = version;
    showUpdateBanner('A new version (' + nextVersion + ') is available, would you like to install it when closing the app?');
}

function showUpdateBanner(text) {
    get('banner-text').innerHTML = text;
    get('banner-yes').tabIndex = 0;
    get('banner-skip').tabIndex = 1;
    get('banner').classList.add('show');
}

function hideUpdateBanner() {
    get('banner-yes').tabIndex = -1;
    get('banner-skip').tabIndex = -1;
    get('banner').classList.remove('show');
    eInput.focus();
}

function installUpdate() {
    ipcRenderer.send('input:update-install');
    hideUpdateBanner();
}

function skipUpdate() {
    ipcRenderer.send('input:update-skip', { nextVersion: nextVersion });
    hideUpdateBanner();
}
