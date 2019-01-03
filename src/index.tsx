import {render} from 'react-dom';
import * as React from 'react';
import {CalcApp} from './calculator_registers_component';
import {connect, Provider} from 'react-redux';
import {store} from './redux_actions';

const divEl = document.createElement('div');
divEl.id = 'app';
document.getElementsByTagName('body')[0].appendChild(divEl);

const stylesCss = require('./styles.css');
const linkEl = document.createElement('link');
linkEl.href = stylesCss;
linkEl.rel = 'stylesheet';
linkEl.type = 'text/css';

const headEl = document.getElementsByTagName('head')[0];
headEl.appendChild(linkEl);
const metaEl = document.createElement('meta');
metaEl.name = 'viewport';
metaEl.content = 'width=900, user-scalable=0'; // initial-scale=1.0, maximum-scale=1.0,
// metaEl.content = 'width=device-width';
headEl.appendChild(metaEl);
import {
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
  buttonEnter,
  buttonMinus,
  buttonTimes,
  buttonDiv,
  buttonPercentTotal,
  buttonPercentChange,
  buttonPercent,
  buttonYtoX,
  buttonSigmaPlus,
  buttonCHS,
  buttonRecipX,
  buttonCLx,
  buttonF,
  buttonG,
  buttonRotateStack,
  buttonSwapXY,
  buttonSTO,
  buttonRCL,
  buttonFV,
  buttonPMT,
  buttonI,
  buttonN,
  buttonPV,
  buttonEEX,
  buttonRunStop,
  buttonSingleStep,
} from './redux_actions';

function identity(x: any) {
  return x;
}

function nullx() {
  return {};
}

const connector = connect(
  identity,
  nullx
);
const HookedApp = connector(CalcApp);

function showx() {
  render(
    <Provider store={store}>
      <HookedApp />
    </Provider>,
    document.getElementById('app')
  );
}
store.subscribe(showx);
showx();

// IRR Debugging
// store.dispatch({type: 5});
// store.dispatch({type: 0});
// store.dispatch({type: 0});
// store.dispatch({type: 'g'});
// store.dispatch({type: 'PV'});
// store.dispatch({type: 3});
// store.dispatch({type: 'g'});
// store.dispatch({type: 'FV'});

// store.dispatch({type: 5});
// store.dispatch({type: 7});
// store.dispatch({type: 0});
// store.dispatch({type: 'chs'});
// store.dispatch({type: 'g'});
// store.dispatch({type: 'PMT'});
// store.dispatch({type: 'f'});
// store.dispatch({type: 'FV'});

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
  buttonSecondEnter: buttonEnter,
  buttonMinus,
  buttonF,
  buttonG,
  buttonSTO,
  buttonRCL,
  buttonSigmaPlus,
  // buttonOnOff: () => store,
};

Object.keys(clickers).forEach(id => {
  // console.log('attempting to add listener for ' + id);
  let el = window.document.getElementById(id);
  el.addEventListener('mousedown', () => el.classList.add('buttonDown'));
  el.addEventListener('mouseup', () => el.classList.remove('buttonDown'));
  el.addEventListener('touchstart', () => el.classList.add('buttonDown'));
  el.addEventListener('click', clickers[id]);
  el.addEventListener('touchend', (event: Event) => {
    event.preventDefault();
    el.click();
    el.classList.remove('buttonDown');
  });
  // console.log('added');
});
