/* ---- MODULES ---- */
const { ipcRenderer } = require('electron');
const katex = require('katex');


/* ---- VARS ---- */
let eOutput, eBackground;


/* ---- IPC ---- */
ipcRenderer.on('tex', (event, args) => updateTex(args));
ipcRenderer.on('settings', (event, args) => applySettings(args));


/* ---- INIT ---- */
handle(window, 'DOMContentLoaded', () => {
    eOutput = get('tex-output');
    eBackground = get('background');
    new ResizeObserver(sizeChanged).observe(eOutput);
    ipcRenderer.send('output:ready');
});


/* ---- HANDLER & UTILITY FUNCTIONS ---- */
function get(id) { return document.getElementById(id); }
function handle(element, event, listener) { element.addEventListener(event, listener); }

function updateTex(tex) {
    katex.render(
        tex,
        eOutput,
        {
            displayMode: true,
            output: 'html',
            throwOnError: false,
            strict: 'ignore'
        }
    );
}

function sizeChanged() {
    ipcRenderer.send('output:size', {
        width: eOutput.offsetWidth,
        height: eOutput.offsetHeight
    });
}

function applySettings(settings) {
    eOutput.style.color = settings.outputForegroundColor;
    eOutput.style.opacity = settings.outputForegroundOpacity / 100;
    eBackground.style.backgroundColor = settings.outputBackgroundColor;
    eBackground.style.opacity = settings.outputBackgroundOpacity / 100;
}
