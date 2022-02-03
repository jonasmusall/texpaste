console.time('startup');
console.time('show');
/* ---- MODULES ---- */
const Deferred = require('./lib/deferred');
const { app, BrowserWindow, ipcMain, clipboard, shell } = require('electron');
const path = require('path');
const updaterDf = new Deferred();
const semverDf = new Deferred();


/* ---- VARS ---- */
let winIn, winOut;
const winInDf = new Deferred();
const winOutDf = new Deferred();
const storeDf = new Deferred();
let imgOut = null;
let isSettingsWindowOpen = false;


/* ---- IPC ---- */
ipcMain.handle('get-version', app.getVersion);
ipcMain.on('open-repos', () => shell.openExternal('https://github.com/jonasmusall/texpaste'));

ipcMain.on('input:ready', () => {
    console.log('Resolving winIn');
    winInDf.resolve(winIn);
    winInUpdateSettings();
    console.timeEnd('startup');
});
ipcMain.on('input:tex', async (event, args) => (await winOutDf.promise).webContents.send('tex', args));
ipcMain.on('input:accept', acceptInput);
ipcMain.on('input:open-settings', createSettingsWindow);
ipcMain.on('input:update-check', checkForUpdates);
ipcMain.on('input:update-install', installUpdateOnQuit);

ipcMain.on('output:ready', () => {
    winOutDf.resolve(winOut);
    winOutUpdateSettings();
});
ipcMain.on('output:size', (event, args) => winOut.setSize(args.width + 60, args.height));

ipcMain.handle('settings:read', async () => (await storeDf.promise).store);
ipcMain.on('settings:write', (event, args) => updateSettings(args));


/* ---- APP STARTUP ---- */
app.whenReady().then(() => {
    createInputWindow();
    createOutputWindow();
});
// call afterFrontEndReady after input window is definitely done
winInDf.promise.then(() => setTimeout(afterFrontEndReady, 100));


/* ---- WINDOW FUNCTIONS ---- */
function createInputWindow() {
    winIn = new BrowserWindow({
        width: 700,
        height: 200,
        resizable: false,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'app/preload/input.js')
        }
    });
    winIn.loadFile('app/input.html');
    winIn.once('ready-to-show', () => { winIn.show(); console.timeEnd('show'); });
    winIn.on('close', async () => (await winOutDf.promise).close());
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
            preload: path.join(__dirname, 'app/preload/output.js')
        }
    });
    winOut.loadFile('app/output.html');
    winOut.webContents.on('paint', (event, dirty, image) => {
        imgOut = image;
    });
}

function createSettingsWindow() {
    if (!isSettingsWindowOpen) {
        isSettingsWindowOpen = true;
        const winSettings = new BrowserWindow({
            width: 300,
            height: 566,
            resizable: false,
            minimizable: false,
            maximizable: false,
            show: false,
            parent: winIn,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'app/preload/settings.js')
            }
        });
        winSettings.menuBarVisible = false;
        winSettings.loadFile('app/settings.html');
        winSettings.once('ready-to-show', () => winSettings.show());
        winSettings.on('close', () => isSettingsWindowOpen = false);
    }
}

async function winInUpdateSettings() {
    (await winInDf.promise).webContents.send('settings', (await storeDf.promise).store);
}

async function winOutUpdateSettings() {
    (await winOutDf.promise).webContents.send('settings', (await storeDf.promise).store);
}


/* ---- UTILITY FUNCTIONS ---- */
async function acceptInput() {
    if (imgOut != null) {
        clipboard.writeImage(imgOut);
    }
    (await winInDf.promise).close();
}

function afterFrontEndReady() {
    console.log('Initializing updater and store');
    updaterDf.resolve(require('electron-updater').autoUpdater);
    semverDf.resolve(require('semver'));
    initUpdater();
    checkForUpdates();
    initStore();
}

async function initUpdater() {
    const updater = await updaterDf.promise;
    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = (await storeDf.promise).get('updateAutoinstall');
    updater.removeAllListeners('update-available');
    updater.addListener('update-available', async (info) => {
        const store = await storeDf.promise;
        if ((await semverDf.promise).gt(info.version, store.get('updateSkipVersion'))) {
            if (store.get('updateAutoinstall')) {
                (await updaterDf.promise).downloadUpdate();
            } else {
                (await winInDf.promise).webContents.send('update-notify', { nextVersion: info.version });
            }
        }
    });
}

async function checkForUpdates() {
    if ((await storeDf.promise).get('updateCheck')) {
        (await updaterDf.promise).checkForUpdates().catch(reason => {
            console.log('Update check failed. Reason:');
            console.log(reason);
        });
    }
}

async function installUpdateOnQuit() {
    const updater = await updaterDf.promise;
    updater.downloadUpdate();
    updater.autoInstallOnAppQuit = true;
}

function initStore() {
    const Store = require('electron-store');
    storeDf.resolve(new Store({
        schema: {
            updateCheck: {
                type: 'boolean',
                default: true
            },
            updateAutoinstall: {
                type: 'boolean',
                default: true
            },
            updateSkipVersion: {
                type: 'string',
                default: '0.0.0'
            },
            behaviorAllowDrag: {
                type: 'boolean',
                default: false
            },
            behaviorMacros: {
                type: "object",
                default: {}
            },
            outputForegroundColor: {
                type: 'string',
                default: '#ffffff'
            },
            outputForegroundOpacity: {
                type: 'integer',
                default: 100
            },
            outputBackgroundColor: {
                type: 'string',
                default: '#000000'
            },
            outputBackgroundOpacity: {
                type: 'integer',
                default: 0
            }
        }
    }));
    console.log('Store initialized');
}

async function updateSettings(settings) {
    console.log('Updating settings');
    const store = await storeDf.promise;
    // if updateCheck was reenabled, clear updateSkipVersion
    if (settings.updateCheck && !store.get('updateCheck')) {
        store.store = settings;
        store.reset('updateSkipVersion');
    } else {
        store.store = settings;
    }
    winInUpdateSettings();
    winOutUpdateSettings();
    initUpdater();
    checkForUpdates();
}
