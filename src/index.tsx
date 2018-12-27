import {render} from 'react-dom';
import * as React from 'react';
import {CalculatorStack, CalculatorRegisters} from './calculator_registers_component';
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

const HookedStack = connect(
  identity,
  nullx
)(CalculatorStack);

const HookedRegisters = connect(
  identity,
  nullx
)(CalculatorRegisters);

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
}
store.subscribe(showx);

window.document.getElementById('buttonN').addEventListener('click', buttonN);
window.document.getElementById('buttonI').addEventListener('click', buttonI);
window.document.getElementById('buttonPV').addEventListener('click', buttonPV);
window.document.getElementById('buttonPMT').addEventListener('click', buttonPMT);
window.document.getElementById('buttonFV').addEventListener('click', buttonFV);
window.document.getElementById('buttonCHS').addEventListener('click', buttonCHS);
window.document.getElementById('buttonDiv').addEventListener('click', buttonDiv);
window.document.getElementById('buttonYtoX').addEventListener('click', buttonYtoX);
window.document.getElementById('buttonRecipX').addEventListener('click', buttonRecipX);
window.document.getElementById('buttonPercentTotal').addEventListener('click', buttonPercentTotal);
window.document
  .getElementById('buttonPercentChange')
  .addEventListener('click', buttonPercentChange);
window.document.getElementById('buttonPercent').addEventListener('click', buttonPercent);
window.document.getElementById('buttonEEX').addEventListener('click', buttonEEX);
window.document.getElementById('button1').addEventListener('click', button1);
window.document.getElementById('button2').addEventListener('click', button2);
window.document.getElementById('button3').addEventListener('click', button3);
window.document.getElementById('button4').addEventListener('click', button4);
window.document.getElementById('button5').addEventListener('click', button5);
window.document.getElementById('button6').addEventListener('click', button6);
window.document.getElementById('button7').addEventListener('click', button7);
window.document.getElementById('button8').addEventListener('click', button8);
window.document.getElementById('button9').addEventListener('click', button9);
window.document.getElementById('button0').addEventListener('click', button0);
window.document.getElementById('buttonPlus').addEventListener('click', buttonPlus);
window.document.getElementById('buttonPoint').addEventListener('click', buttonPoint);
window.document.getElementById('buttonTimes').addEventListener('click', buttonTimes);
window.document.getElementById('buttonRunStop').addEventListener('click', buttonRunStop);
window.document.getElementById('buttonSingleStep').addEventListener('click', buttonSingleStep);
window.document.getElementById('buttonRotateStack').addEventListener('click', buttonRotateStack);
window.document.getElementById('buttonSwapXY').addEventListener('click', buttonSwapXY);
window.document.getElementById('buttonCLx').addEventListener('click', buttonCLx);
window.document.getElementById('buttonEnter').addEventListener('click', buttonEnter);
window.document.getElementById('buttonMinus').addEventListener('click', buttonMinus);
// window.document.getElementById('buttonOnOff').addEventListener('click', buttonOnOff);
window.document.getElementById('buttonF').addEventListener('click', buttonF);
window.document.getElementById('buttonG').addEventListener('click', buttonG);
window.document.getElementById('buttonSTO').addEventListener('click', buttonSTO);
window.document.getElementById('buttonRCL').addEventListener('click', buttonRCL);
window.document.getElementById('buttonSigmaPlus').addEventListener('click', buttonSigmaPlus);
showx();
