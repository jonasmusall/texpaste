type InputWindowContextBridgeApi = {
  addSettingsChangedListener: (listener: (settings: any) => void) => void,
  addUpdateAvailableListener: (listener: (updateInfo: { nextVersion: string, selfUpdate: boolean }) => void) => void,
  openSettings: () => void,
  acceptInput: () => void,
  setTexTarget: (target: HTMLElement) => void,
  updateTex: (tex: string) => void,
  installUpdate: () => void,
  openReleasePage: (version: string) => void,
  skipUpdate: (version: string) => void
}

type OutputWindowContextBridgeApi = {
  addSettingsChangedListener: (listener: (settings: any) => void) => void,
  setTexTarget: (target: HTMLElement) => void,
  setWindowSize: (width: number, height: number) => void
}

type SettingsWindowContextBridgeApi = {
  getAppVersion: () => Promise<string>,
  openRepository: () => void,
  readSettings: () => Promise<{ settings: any, selfUpdate: boolean }>,
  writeSettings: (settings: any) => void
}
