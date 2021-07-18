const { app, BrowserWindow } = require("electron");
const katex = require("katex");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 300,
        frame: false,
        resizable: false
    });
    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();
});
