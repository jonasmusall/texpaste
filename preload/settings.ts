import { contextBridge } from 'electron';
import { ipcRenderer } from './lib/ipcRenderer';

const settingsWindowApi: SettingsWindowContextBridgeApi = {
  getAppVersion(): Promise<string> {
    return ipcRenderer.invoke('get-version');
  },

  openRepository(): void {
    ipcRenderer.send('open-repos');
  },

  readSettings(): Promise<{ settings: any; selfUpdate: boolean; }> {
    return ipcRenderer.invoke('read-settings');
  },

  writeSettings(settings: any): void {
    ipcRenderer.send('write-settings', settings);
  }
}

contextBridge.exposeInMainWorld('settingsWindowApi', settingsWindowApi);
