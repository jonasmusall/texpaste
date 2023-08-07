const { ipcRenderer } = require('electron');
const humanFormat = require('human-format');

const formatOptions = { unit: 'B' };
let progressPercent, progressBar, progressText;

ipcRenderer.on('update-progress', (event, args) => updateProgress(args.transferred, args.total, args.bytesPerSecond));

window.addEventListener('DOMContentLoaded', () => {
    progressPercent = document.getElementById('progress-percent');
    progressBar = document.getElementById('progress-bar');
    progressText = document.getElementById('progress-text');

    ipcRenderer.send('update:ready');
})

function updateProgress(transferred, total, bytesPerSecond) {
    let percent = transferred / total * 100;
    progressPercent.innerText = `${Math.round(percent)}%`;
    progressBar.value = percent;
    progressText.innerText = `${humanFormat(transferred, formatOptions)}/${humanFormat(total, formatOptions)} at ${humanFormat(bytesPerSecond, formatOptions)}/s`
}
