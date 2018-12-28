import {render} from 'react-dom';
import * as React from 'react';
import {CalculatorStack, CalculatorRegisters, CashFlows} from './calculator_registers_component';
import {connect, Provider} from 'react-redux';
import {store} from './redux_actions';

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
const HookedStack = connector(CalculatorStack);
const HookedRegisters = connector(CalculatorRegisters);
const HookedCashFlows = connector(CashFlows);

function showx() {
  console.log(store.getState());
  render(
    <Provider store={store}>
      <HookedStack />
    </Provider>,
    document.getElementById('stack')
  );

  render(
    <Provider store={store}>
      <HookedRegisters />
    </Provider>,
    document.getElementById('registers')
  );

  render(
    <Provider store={store}>
      <HookedCashFlows />
    </Provider>,
    document.getElementById('cashflows')
  );
}
store.subscribe(showx);

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
  // buttonOnOff
};

Object.keys(clickers).forEach(id => {
  console.log('attempting to add listener for ' + id);
  window.document.getElementById(id).addEventListener('click', clickers[id]);
});

showx();
