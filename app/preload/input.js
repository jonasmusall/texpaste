console.time('preload');
/* ---- MODULES ---- */
const { ipcRenderer } = require('electron');
const katex = require('katex');


/* ---- VARS ---- */
let eInput, eOutput;
let showAcceptRipple = false;
let nextVersion;
let selfUpdate;
let macros = {};


/* ---- IPC ---- */
ipcRenderer.on('settings', (event, args) => applySettings(args));
ipcRenderer.on('update-notify', (event, args) => handleUpdateAvailable(args));


/* ---- INIT ---- */
handle(window, 'DOMContentLoaded', () => {
    eInput = get('tex-input');
    eOutput = get('tex-output');

    handle(eInput, 'input', updateTex);
    handle(eInput, 'keyup', handleInputKeyUp);
    handle(get('accept'), 'click', accept);
    handle(get('cancel'), 'click', cancel);
    handle(get('settings'), 'click', () => ipcRenderer.send('input:open-settings'));
    handle(get('banner-confirm'), 'click', confirmUpdate);
    handle(get('banner-skip'), 'click', skipUpdate);
    handle(window, 'focus', () => eInput.focus());
    
    ipcRenderer.send('input:ready');
});


/* ---- HANDLER & UTILITY FUNCTIONS ---- */
function get(id) { return document.getElementById(id); }
function handle(element, event, listener) { element.addEventListener(event, listener); }

function accept() {
    if (showAcceptRipple) {
        eOutput.classList.remove('ghost');
        eOutput.offsetHeight;
        eOutput.classList.add('ghost');
    }
    ipcRenderer.send('input:accept');
    eInput.focus();
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
    showAcceptRipple = !settings.behaviorCloseOnAccept;
    macros = settings.behaviorMacros;
    updateTex();
}

function handleUpdateAvailable(args) {
    nextVersion = args.nextVersion;
    selfUpdate = args.selfUpdate;
    if (selfUpdate) {
        showUpdateBanner('A new version (v' + nextVersion + ') is available, would you like to install it when closing the app?', 'Yes');
    } else {
        showUpdateBanner('A new version (v' + nextVersion + ') is available, would you like to go to the download page for this release?', 'Open');
    }
}

function showUpdateBanner(bannerText, confirmText) {
    get('banner-text').textContent = bannerText;
    const eBannerConfirm = get('banner-confirm');
    eBannerConfirm.textContent = confirmText;
    eBannerConfirm.tabIndex = 0;
    get('banner-skip').tabIndex = 1;
    get('banner').classList.add('show');
}

function hideUpdateBanner() {
    get('banner-confirm').tabIndex = -1;
    get('banner-skip').tabIndex = -1;
    get('banner').classList.remove('show');
    eInput.focus();
}

function confirmUpdate() {
    if (selfUpdate) {
        ipcRenderer.send('input:update-install');
    } else {
        ipcRenderer.send('open-release', nextVersion);
    }
    hideUpdateBanner();
}

function skipUpdate() {
    ipcRenderer.send('input:update-skip', { nextVersion: nextVersion });
    hideUpdateBanner();
}
