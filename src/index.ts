/// Tie redux store to react components and DOM UI buttons

import {renderUI} from './calculator_components';
import {store} from './redux_actions';
import {
  // buttonOnOff,
  button0,
  button1,
  button2,
  button3,
  button4,
  button5,
  button6,
  button7,
  button8,
  button9,
  buttonCHS,
  buttonCLx,
  buttonDiv,
  buttonEEX,
  buttonEnter,
  buttonF,
  buttonFV,
  buttonG,
  buttonI,
  buttonMinus,
  buttonN,
  buttonPercent,
  buttonPercentChange,
  buttonPercentTotal,
  buttonPlus,
  buttonPMT,
  buttonPoint,
  buttonPV,
  buttonRCL,
  buttonRecipX,
  buttonRotateStack,
  buttonRunStop,
  buttonSigmaPlus,
  buttonSingleStep,
  buttonSTO,
  buttonSwapXY,
  buttonTimes,
  buttonYtoX,
} from './redux_actions';

// tslint:disable-next-line no-var-requires
const stylesCss = require('./styles.css');

const headEl = document.getElementsByTagName('head')[0];

const linkEl = document.createElement('link');
linkEl.href = stylesCss;
linkEl.rel = 'stylesheet';
linkEl.type = 'text/css';
headEl.appendChild(linkEl);

const appleIcon = document.createElement('link');
appleIcon.rel = 'apple-touch-icon';
appleIcon.href = './images/icon.png';
headEl.appendChild(appleIcon);

const themeColor = document.createElement('meta');
themeColor.name = 'theme-color';
themeColor.content = '#ff8844';
headEl.appendChild(themeColor);

// tslint:disable-next-line no-var-requires
for (const iconSize of ['167', '180', '152']) {
  const sizedIcon = document.createElement('link');
  sizedIcon.rel = 'apple-touch-icon';
  sizedIcon.href = './images/icon-' + iconSize + 'x' + iconSize + '.png';
  (sizedIcon as any).sizes = iconSize + 'x' + iconSize;
  headEl.appendChild(sizedIcon);
}
const manifest = require('./manifest.webmanifest');
const manifestTag = document.createElement('link');
manifestTag.rel = 'manifest';
manifestTag.href = manifest;
headEl.appendChild(manifestTag);

store.subscribe(() => renderUI(store));
renderUI(store);

const clickers: {[id: string]: () => void} = {
  buttonN,
  buttonI,
  buttonPV,
  buttonPMT,
  buttonFV,
  buttonCHS,
  buttonDiv,
  buttonYtoX,
  buttonRecipX,
  buttonPercentTotal,
  buttonPercentChange,
  buttonPercent,
  buttonEEX,
  button0,
  button1,
  button2,
  button3,
  button4,
  button5,
  button6,
  button7,
  button8,
  button9,
  buttonPlus,
  buttonPoint,
  buttonTimes,
  buttonRunStop,
  buttonSingleStep,
  buttonRotateStack,
  buttonSwapXY,
  buttonCLx,
  buttonEnter,
  buttonMinus,
  buttonF,
  buttonG,
  buttonSTO,
  buttonRCL,
  buttonSigmaPlus,
  // buttonOnOff,
};

Object.keys(clickers).forEach(id => {
  console.log('attempting to add listener for ' + id);
  const el = window.document.getElementById(id);
  el.addEventListener('mousedown', () => {
    navigator.vibrate(50);
    el.classList.add('buttonDown');
  });
  el.addEventListener('mouseup', () => el.classList.remove('buttonDown'));
  el.addEventListener('touchstart', () => {
    navigator.vibrate(50);
    el.classList.add('buttonDown');
  });
  el.addEventListener('click', clickers[id]);
  el.addEventListener('touchend', (event: Event) => {
    event.preventDefault();
    el.click();
    el.classList.remove('buttonDown');
  });
});

console.log('going to hide the button');
const addBtn = document.getElementById('add-button');
addBtn.style.display = 'none';
console.log('hid the button');
window.addEventListener('beforeinstallprompt', e => {
  console.log('beforeinstall!');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  let deferredPrompt: any = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', e => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});
