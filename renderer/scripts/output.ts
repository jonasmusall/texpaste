import { id, listen } from './lib/util.js';
declare const outputWindowApi: OutputWindowContextBridgeApi;


const texOutput = id('tex-output') as HTMLDivElement;
const background = id('background') as HTMLDivElement;


outputWindowApi.setTexTarget(texOutput);
new ResizeObserver(sizeChanged).observe(texOutput);


function sizeChanged() {
  outputWindowApi.setWindowSize(texOutput.offsetWidth, texOutput.offsetHeight);
}

function applySettings(settings: any) {
  texOutput.style.color = settings.outputForegroundColor;
  texOutput.style.opacity = `${settings.outputForegroundOpacity / 100}`;
  background.style.backgroundColor = settings.outputBackgroundColor;
  background.style.opacity = `${settings.outputBackgroundOpacity / 100}`;
}
