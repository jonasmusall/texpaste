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

const outputWindowApi : OutputWindowContextBridgeApi = {
  addSettingsChangedListener(listener: (settings: any) => void): void {
    ipcRenderer.on('settings', (_event, settings) => {
      listener(settings);
    });
  },

  setTexTarget(target: HTMLElement): void {
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

  setWindowSize(width: number, height: number): void {
    ipcRenderer.send('resize-output', { width, height });
  }
}

contextBridge.exposeInMainWorld('outputWindowApi', outputWindowApi);
