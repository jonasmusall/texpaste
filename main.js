const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const Store = require("electron-store");
const { autoUpdater } = require("electron-updater");
const semver = require("semver");
const path = require("path");

let winIn, winOut;
let imgOut;
let isSettingsWindowOpen = false;
let store;

ipcMain.on("size", (event, args) => {
    winOut.setSize(args.width + 60, args.height);
});

ipcMain.on("tex", (event, args) => {
    winOut.webContents.send("tex", args);
});

ipcMain.on("open-settings", (event, args) => {
    if (!isSettingsWindowOpen) {
        isSettingsWindowOpen = true;
        createSettingsWindow();
    }
});

ipcMain.handle("read-settings", async (event, args) => {
    return store.store;
});

ipcMain.on("write-settings", (event, args) => {
    //if updateCheck was reenabled, clear updateSkipVersion
    if (args.updateCheck && !store.get("updateCheck")) {
        store.store = args;
        store.reset("updateSkipVersion");
    } else {
        store.store = args;
    }
    setupAutoUpdater();
    checkForUpdates();
});

ipcMain.on("update-check", (event, args) => {
    checkForUpdates();
})

ipcMain.on("update-install", (event, args) => {
    autoUpdater.downloadUpdate();
    autoUpdater.autoInstallOnAppQuit = true;
});

ipcMain.on("update-skip", (event, args) => {
    store.set("updateSkipVersion", args.nextVersion);
});

ipcMain.on("accept", (event, args) => {
    clipboard.writeImage(imgOut);
    winIn.close();
});

function createInputWindow() {
    winIn = new BrowserWindow({
        width: 700,
        height: 200,
        resizable: false,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "app/preload/input.js")
        }
    });
    winIn.loadFile("app/input.html");
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
            preload: path.join(__dirname, "app/preload/output.js")
        }
    });
    winOut.loadFile("app/output.html");
    winOut.webContents.on("paint", (event, dirty, image) => {
        imgOut = image;
    });
}

function createSettingsWindow() {
    const winSettings = new BrowserWindow({
        width: 300,
        height: 400,
        resizable: false,
        minimizable: false,
        maximizable: false,
        show: false,
        parent: winIn,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, "app/preload/settings.js")
        }
    });
    winSettings.menuBarVisible = false;
    winSettings.loadFile("app/settings.html");
    winSettings.once("ready-to-show", () => winSettings.show());
    winSettings.on("close", () => isSettingsWindowOpen = false);
}

function setupAutoUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = store.get("updateAutoinstall");
    autoUpdater.removeAllListeners("update-available");
    autoUpdater.addListener("update-available", (info) => {
        if (semver.gt(info.version, store.get("updateSkipVersion"))) {
            if (store.get("updateAutoinstall")) {
                autoUpdater.downloadUpdate();
            } else {
                winIn.webContents.send("update-notify", { nextVersion: info.version });
            }
        }
    })
}

function checkForUpdates() {
    if (store.get("updateCheck")) {
        autoUpdater.checkForUpdates();
    }
}

app.whenReady().then(() => {
    store = new Store({
        schema: {
            updateCheck: {
                type: "boolean",
                default: true
            },
            updateAutoinstall: {
                type: "boolean",
                default: true
            },
            updateSkipVersion: {
                type: "string",
                default: "0.0.0"
            }
        }
    });
    setupAutoUpdater();
    createOutputWindow();
    createInputWindow();
});
