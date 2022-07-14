import { contextBridge } from 'electron';
import { ipcRenderer } from './lib/ipcRenderer';
import { katexRender } from './lib/katex';

let texTarget: HTMLElement | undefined;
let lastTex: string | undefined;
let macros = {};
ipcRenderer.on('settings', (_event, settings) => {
  macros = settings.behaviorMacros;
  if (texTarget && lastTex) {
    katexRender(lastTex, texTarget, macros);
  }
});

const inputWindowApi : InputWindowContextBridgeApi = {
  addSettingsChangedListener(listener: (settings: any) => void): void {
    ipcRenderer.on('settings', (_event, settings) => {
      listener(settings);
    });
  },

  addUpdateAvailableListener(listener: (updateInfo: { nextVersion: string; selfUpdate: boolean; }) => void): void {
    ipcRenderer.on('update-notify', (_event, updateInfo) => {
      listener(updateInfo);
    });
  },

  openSettings(): void {
    ipcRenderer.send('open-settings');
  },

  acceptInput(): void {
    ipcRenderer.send('accept');
  },

  setTexTarget(target: HTMLElement) {
    texTarget = target;
    if (lastTex) {
      katexRender(lastTex, texTarget, macros);
    }
  },

  updateTex(tex: string): void {
    ipcRenderer.send('tex', tex);
    lastTex = tex;
    if (texTarget) {
      katexRender(tex, texTarget, macros);
    }
  },

  installUpdate(): void {
    ipcRenderer.send('install-update');
  },

  openReleasePage(version: string): void {
    ipcRenderer.send('open-release', version);
  },

  skipUpdate(version: string): void {
    ipcRenderer.send('skip-update', version);
  }
};

contextBridge.exposeInMainWorld('inputWindowApi', inputWindowApi);
