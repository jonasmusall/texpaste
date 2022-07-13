type IpcMainToRendererChannels = {
  'settings': (settings: any) => void,
  'update-notify': (updateInfo: { nextVersion: string, selfUpdate: boolean }) => void,
  'tex': (tex: string) => void
};

type IpcRendererToMainChannels = {
  'get-version': () => string,
  'open-repos': () => void,
  'open-release': (version: string) => void,
  'tex': (tex: string) => void,
  'accept': () => void,
  'open-settings': () => void,
  'install-update': () => void,
  'skip-update': (version: string) => void,
  'resize-output': (dimensions: { width: number, height: number }) => void,
  'read-settings': () => { settings: any, selfUpdate: boolean },
  'write-settings': (settings: any) => void
};

type IpcSignature<C extends (keyof IpcMainToRendererChannels | keyof IpcRendererToMainChannels)> =
  C extends keyof IpcMainToRendererChannels ? IpcMainToRendererChannels[C] : (
    C extends keyof IpcRendererToMainChannels ? IpcRendererToMainChannels[C] : never
  );
type IpcMessageArguments<C extends (keyof IpcMainToRendererChannels | keyof IpcRendererToMainChannels)> = Parameters<IpcSignature<C>>;
type IpcMessageResult<C extends (keyof IpcMainToRendererChannels | keyof IpcRendererToMainChannels)> = ReturnType<IpcSignature<C>>;
