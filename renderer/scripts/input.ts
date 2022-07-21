import { id, listen } from './lib/util.js';
declare const inputWindowApi: InputWindowContextBridgeApi;


const texInput = id('tex-input') as HTMLInputElement;
const texOutput = id('tex-output') as HTMLDivElement;


let showAcceptRipple = false;
let nextVersion = '0.0.0';
let selfUpdate = false;


inputWindowApi.setTexTarget(texOutput);
listen(texInput, 'input', updateTex);
listen(texInput, 'keyup', handleInputKeyUp);
listen(id('accept')!, 'click', accept);
listen(id('cancel')!, 'click', cancel);
listen(id('settings')!, 'click', inputWindowApi.openSettings);
listen(id('banner-confirm')!, 'click', confirmUpdate);
listen(id('banner-skip')!, 'click', skipUpdate);
listen(window, 'focus', () => texInput.focus());


function accept() {
  if (showAcceptRipple) {
    texOutput.classList.remove('ghost');
    texOutput.offsetHeight;
    texOutput.classList.add('ghost');
  }
  inputWindowApi.acceptInput();
  texInput.focus();
}

function cancel() {
  window.close();
}

function updateTex() {
  inputWindowApi.updateTex(texInput.value);
}

function handleInputKeyUp(event: KeyboardEvent) {
  if (event.key == 'Enter') {
    accept();
  } else if (event.key == 'Escape') {
    cancel();
  }
}

function applySettings(settings: any) {
  if (settings.behaviorAllowDrag) {
    document.body.classList.add('draggable');
  } else {
    document.body.classList.remove('draggable');
  }
  showAcceptRipple = !settings.behaviorCloseOnAccept;
}

function handleUpdateAvailable(args: { nextVersion: string, selfUpdate: boolean }) {
  nextVersion = args.nextVersion;
  selfUpdate = args.selfUpdate;
  if (selfUpdate) {
    showUpdateBanner('A new version (v' + nextVersion + ') is available, would you like to install it when closing the app?', 'Yes');
  } else {
    showUpdateBanner('A new version (v' + nextVersion + ') is available, would you like to go to the download page for this release?', 'Open');
  }
}

function showUpdateBanner(bannerText: string, confirmText: string) {
  id('banner-text')!.textContent = bannerText;
  const eBannerConfirm = id('banner-confirm')!;
  eBannerConfirm.textContent = confirmText;
  eBannerConfirm.tabIndex = 0;
  id('banner-skip')!.tabIndex = 1;
  id('banner')!.classList.add('show');
}

function hideUpdateBanner() {
  id('banner-confirm')!.tabIndex = -1;
  id('banner-skip')!.tabIndex = -1;
  id('banner')!.classList.remove('show');
  texInput.focus();
}

function confirmUpdate() {
  if (selfUpdate) {
    inputWindowApi.installUpdate();
  } else {
    inputWindowApi.openReleasePage(nextVersion);
  }
  hideUpdateBanner();
}

function skipUpdate() {
  inputWindowApi.skipUpdate(nextVersion);
  hideUpdateBanner();
}
