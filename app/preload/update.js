const { ipcRenderer } = require('electron');
const humanFormat = require('human-format');

const formatOptions = { unit: 'B' };
let progressBar, progressText;

ipcRenderer.on('update-progress', (event, args) => updateProgress(args.transferred, args.total, args.bytesPerSecond));

window.addEventListener('DOMContentLoaded', () => {
    progressBar = document.getElementById('progress-bar');
    progressText = document.getElementById('progress-text');

    document.getElementById('cancel').addEventListener('click', () => window.close())

    ipcRenderer.send('update:ready');
})

function updateProgress(transferred, total, bytesPerSecond) {
    progressBar.value = transferred / total;
    progressText.innerText = `${humanFormat(transferred, formatOptions)}/${humanFormat(total, formatOptions)} at ${humanFormat(bytesPerSecond, formatOptions)}/s`
}
