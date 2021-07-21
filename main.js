const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 700,
        height: 200,
        resizable: false,
        alwaysOnTop: true,
        show: false,
        frame: false
    });
    win.loadFile("index.html");
    win.once("ready-to-show", () => win.show());
}

app.whenReady().then(() => {
    createWindow();
});
