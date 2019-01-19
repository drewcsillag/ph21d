/// Tie redux store to react components and DOM UI buttons

import {renderUI} from './calculator_registers_component';
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
const linkEl = document.createElement('link');
linkEl.href = stylesCss;
linkEl.rel = 'stylesheet';
linkEl.type = 'text/css';

const headEl = document.getElementsByTagName('head')[0];
headEl.appendChild(linkEl);

// tslint:disable-next-line no-var-requires
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
  buttonEnter2: buttonEnter,
  buttonMinus,
  buttonF,
  buttonG,
  buttonSTO,
  buttonRCL,
  buttonSigmaPlus,
  // buttonOnOff,
};

Object.keys(clickers).forEach(id => {
  if (id !== 'buttonEnter' && id !== 'buttonEnter2') {
    // console.log('attempting to add listener for ' + id);
    const el = window.document.getElementById(id);
    el.addEventListener('mousedown', () => el.classList.add('buttonDown'));
    el.addEventListener('mouseup', () => el.classList.remove('buttonDown'));
    el.addEventListener('touchstart', () => el.classList.add('buttonDown'));
    el.addEventListener('click', clickers[id]);
    el.addEventListener('touchend', (event: Event) => {
      event.preventDefault();
      el.click();
      el.classList.remove('buttonDown');
    });
  } else {
    const enter1 = window.document.getElementById('buttonEnter');
    const enter2 = window.document.getElementById('buttonEnter2');
    function addem() {
      enter1.classList.add('buttonDownEnter1');
      enter2.classList.add('buttonDownEnter2');
    }
    function remem() {
      enter1.classList.remove('buttonDownEnter1');
      enter2.classList.remove('buttonDownEnter2');
    }

    for (const el of [enter1, enter2]) {
      el.addEventListener('mousedown', addem);
      el.addEventListener('mouseup', remem);
      el.addEventListener('touchstart', addem);
      el.addEventListener('click', clickers[id]);
      el.addEventListener('touchend', (event: Event) => {
        event.preventDefault();
        el.click();
        remem();
      });
    }
  }
});