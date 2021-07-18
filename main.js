const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 700,
        height: 200,
        frame: false,
        resizable: false
    });
    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();
});
