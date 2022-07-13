import { contextBridge } from 'electron';
import { ipcRenderer } from './lib/ipcRenderer';
import katex from 'katex';

let texTarget: HTMLElement | undefined;
let lastTex: string | undefined;
let macros = {};
ipcRenderer.on('settings', (_event, settings) => {
  macros = settings.behaviorMacros;
  if (texTarget && lastTex) {
    katex.render(lastTex, texTarget, { macros });
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
      katex.render(lastTex, texTarget, { macros });
    }
  },

  updateTex(tex: string): void {
    ipcRenderer.send('tex', tex);
    lastTex = tex;
    if (texTarget) {
      katex.render(tex, texTarget, { macros });
    }
  },

  setWindowSize(width: number, height: number): void {
    ipcRenderer.send('resize-output', { width, height });
  }
}

contextBridge.exposeInMainWorld('outputWindowApi', outputWindowApi);
