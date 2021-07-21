const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let winIn, winOut;
let imgOut;

ipcMain.on("size", (event, args) => {
    winOut.setSize(args.width + 60, args.height);
});

ipcMain.on("tex", (event, args) => {
    winOut.webContents.send("tex", args);
});

ipcMain.on("accept", (event, args) => {
    fs.writeFileSync("output.png", imgOut.toPNG());
    winIn.close();
});

function createInputWindow() {
    winIn = new BrowserWindow({
        width: 700,
        height: 200,
        resizable: false,
        alwaysOnTop: true,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload_input.js")
        }
    });
    winIn.loadFile("input.html");
    winIn.once("ready-to-show", () => winIn.show());
    winIn.on("close", () => winOut.close());
}

function createOutputWindow() {
    winOut = new BrowserWindow({
        width: 100,
        height: 100,
        frame: false,
        transparent: true,
        show: false,
        webPreferences: {
            offscreen: true,
            preload: path.join(__dirname, "preload_output.js")
        }
    });
    winOut.loadFile("output.html");
    winOut.webContents.on("paint", (event, dirty, image) => {
        imgOut = image;
    });
}

app.whenReady().then(() => {
    createOutputWindow();
    createInputWindow();
});
