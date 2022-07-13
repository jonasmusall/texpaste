import { ipcRenderer as electronIpcRenderer, IpcRendererEvent } from 'electron';

export const ipcRenderer = {
  on<C extends keyof IpcMainToRendererChannels>(channel: C, listener: (event: IpcRendererEvent, ...args: IpcMessageArguments<C>) => void): void {
    electronIpcRenderer.on(channel, listener as (event: IpcRendererEvent, ...args: any[]) => void);
  },

  send<C extends keyof IpcRendererToMainChannels>(channel: C, ...args: IpcMessageArguments<C>): void {
    electronIpcRenderer.send(channel, ...args);
  },

  invoke<C extends keyof IpcRendererToMainChannels>(channel: C, ...args: IpcMessageArguments<C>): Promise<IpcMessageResult<C>> {
    return electronIpcRenderer.invoke(channel, ...args);
  }
}
