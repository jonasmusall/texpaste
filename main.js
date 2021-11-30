const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const Store = require("electron-store");
const { autoUpdater } = require("electron-updater");
const semver = require("semver");
const path = require("path");

let winIn, winOut;
let imgOut;
let isSettingsWindowOpen = false;
let store;

/* ---- IPC: FROM/TO INPUT WINDOW ---- */

ipcMain.on("size", (event, args) => {
    winOut.setSize(args.width + 60, args.height);
});

ipcMain.on("tex", (event, args) => {
    winOut.webContents.send("tex", args);
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

ipcMain.on("input-get-settings", (event, args) => {
    winInUpdateSettings();
});

function winInUpdateSettings() {
    winIn.webContents.send("update-settings", {
        behaviorAllowDrag: store.get("behaviorAllowDrag"),
        behaviorMacros: store.get("behaviorMacros")
    });
}

ipcMain.on("accept", (event, args) => {
    clipboard.writeImage(imgOut);
    winIn.close();
});

ipcMain.on("open-settings", (event, args) => {
    if (!isSettingsWindowOpen) {
        isSettingsWindowOpen = true;
        createSettingsWindow();
    }
});

/* ---- IPC: FROM SETTINGS WINDOW ---- */

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
    winInUpdateSettings();
    winOutUpdateSettings();
    setupAutoUpdater();
    checkForUpdates();
});

/* ---- IPC: FROM/TO OUTPUT WINDOW ---- */

ipcMain.on("output-get-settings", (event, args) => {
    winOutUpdateSettings();
});

function winOutUpdateSettings() {
    winOut.webContents.send("update-settings", {
        outputForegroundColor: store.get("outputForegroundColor"),
        outputForegroundOpacity: store.get("outputForegroundOpacity"),
        outputBackgroundColor: store.get("outputBackgroundColor"),
        outputBackgroundOpacity: store.get("outputBackgroundOpacity")
    });
}

/* ---- WINDOW CREATION METHODS ---- */

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
        height: 550,
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

/* ---- AUTO UPDATER ---- */

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

/* ---- APP STARTUP ---- */

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
            },
            behaviorAllowDrag: {
                type: "boolean",
                default: false
            },
            behaviorMacros: {
                type: "object",
                default: {}
            },
            outputForegroundColor: {
                type: "string",
                default: "#ffffff"
            },
            outputForegroundOpacity: {
                type: "integer",
                default: 100
            },
            outputBackgroundColor: {
                type: "string",
                default: "#000000"
            },
            outputBackgroundOpacity: {
                type: "integer",
                default: 0
            }
        }
    });
    setupAutoUpdater();
    createOutputWindow();
    createInputWindow();
});
