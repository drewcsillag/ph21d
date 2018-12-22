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

let x = 0;
let y = 0;
let stack3 = 0;
let stack4 = 0;
let dec = 0;
let g = 0;
let f = 0;
let wasresult = 0;
let registers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let N = 0;
let I = 0;
let PV = 0;
let PMT = 0;
let FV = 0;
let hasInput = 0;
let begend = 0;

let wasrcl = 0;
let wassto = 0;

/// doesn't do sto op number

// function showx() {
//   ReactDOM.render(
//     <CalculatorStack x={x} y={y} stack3={stack3} stack4={stack4} />,
//     document.getElementById('stack')
//   );

//   ReactDOM.render(
//     <CalculatorRegisters
//       regFV={FV}
//       regN={N}
//       regI={I}
//       regPMT={PMT}
//       regPV={PV}
//       registers={registers}
//     />,
//     document.getElementById('registers')
//   );
//   wasrcl = 0;
// }

// function buttonRCL() {
//   wasrcl = 1;
//   wassto = 0;
// }

// function buttonSTO() {
//   wassto = 1;
//   wasrcl = 0;
// }

// function number(n: number) {
//   if (wasrcl) {
//     x = registers[n];
//     showx();
//     wasrcl = 0;
//     wasresult = 1;
//     hasInput = 1;
//     return;
//   }
//   if (wassto) {
//     registers[n] = x;
//     wassto = 0;
//     wasresult = 1;
//     showx();
//     //FIXME hasInput?
//     return;
//   }
//   hasInput = 1;
//   if (wasresult) {
//     if (wasresult === 1) {
//       y = x;
//     }
//     wasresult = 0;
//     dec = 0;
//     x = 0;
//   }
//   if (dec === 0) {
//     x = x * 10 + n;
//   } else {
//     dec /= 10;
//     x += dec * n;
//   }
//   showx();
// }

// function buttonG() {
//   f = 0;
//   wassto = 0;
//   wasrcl = 0;
//   g = 1;
// }

// function buttonF() {
//   f = 1;
//   wassto = 0;
//   wasrcl = 0;
//   g = 0;
// }



// function button6() {
//   if (g) {
//     x = registers[6] / registers[2];
//     g = 0;
//     showx();
//     hasInput = 1;
//     wasresult = 1;
//     return;
//   }
//   number(6);
// }
// function button7() {
//   number(7);
// }
// function button8() {
//   number(8);
// }
// function button9() {
//   number(9);
// }
// function buttonPoint() {
//   if (g) {
//     //stddev
//     let n = registers[1];
//     let sx = registers[2];
//     let sx2 = registers[3];
//     let sy = registers[4];
//     let sy2 = registers[5];
//     let den = n * (n - 1);

//     let xnum = n * sx2 - sx ** 2;
//     x = (xnum / den) ** 0.5;

//     let ynum = n * sy2 - sy ** 2;
//     y = (ynum / den) ** 0.5;

//     g = 0;
//     showx();
//     wasresult = 1;
//     hasInput = 1;
//     return;
//   }
//   dec = 1;
//   showx();
// }

// function buttonSingleStep() {
//   if (f) {
//     // clear stats
//     for (let i = 1; i < 7; i++) {
//       registers[i] = 0;
//     }
//     f = 0;
//     hasInput = 0;
//     return;
//   }
//   alert('notimplemented');
// }
// function buttonCLx() {
//   if (f) {
//     for (let i = 0; i < 10; i++) {
//       registers[i] = 0;
//     }
//     f = 0;
//     stack3 = 0;
//     stack4 = 0;
//     y = 0;
//     N = 0;
//     I = 0;
//     PMT = 0;
//     PV = 0;
//     FV = 0;
//   }
//   hasInput = 0;
//   x = 0;
//   dec = 0;
//   showx();
// }

// function afterBinaryOp() {
//   y = stack3;
//   stack3 = stack4;
//   wasresult = 1;
//   hasInput = 1;
//   showx();
// }
// function buttonEnter() {
//   stack4 = stack3;
//   stack3 = y;
//   y = x;
//   wasresult = 1;
//   showx();
// }

// function buttonPlus() {
//   x = x + y;
//   afterBinaryOp();
// }

// function buttonMinus() {
//   x = y - x;
//   afterBinaryOp();
// }
// function buttonTimes() {
//   if (g) {
//     // square
//     x = x * x;
//     afterGUnary();
//     return;
//   }
//   x = y * x;
//   afterBinaryOp();
// }

// function buttonDiv() {
//   x = y / x;
//   afterBinaryOp();
// }

// function buttonCHS() {
//   x = -x;
//   showx();
// }


// function buttonSwapXY() {
//   if (f) {
//     // clear FIN
//     N = 0;
//     I = 0;
//     PV = 0;
//     PMT = 0;
//     FV = 0;
//     f = 0;
//     showx();
//     return;
//   }
//   let t = x;
//   x = y;
//   y = t;
//   hasInput = 1;
//   showx();
// }

// function buttonRotateStack() {
//   let t = x;
//   x = y;
//   y = stack3;
//   stack3 = stack4;
//   stack4 = t;
//   hasInput = 1;
//   showx();
// }

// function buttonRecipX() {
//   if (g) {
//     x = Math.exp(x);
//     afterGUnary();
//     return;
//   }
//   x = 1 / x;
//   hasInput = 1;
//   showx();
// }

// function buttonYtoX() {
//   if (g) {
//     x = x ** 0.5;
//     afterGUnary();
//     return;
//   }
//   x = y ** x;
//   afterBinaryOp();
// }

// function buttonSigmaPlus() {
//   if (g) {
//     registers[1] -= 1;
//     registers[2] -= x;
//     registers[3] -= x * x;
//     registers[4] -= y;
//     registers[5] -= y * y;
//     registers[6] -= x * y;
//     g = 0;
//   } else {
//     registers[1] += 1;
//     registers[2] += x;
//     registers[3] += x * x;
//     registers[4] += y;
//     registers[5] += y * y;
//     registers[6] += x * y;
//   }
//   x = registers[1];
//   wasresult = 2;
//   hasInput = 1;
//   showx();
// }

// function buttonN() {
//   //TODO F

//   if (hasInput) {
//     if (g) {
//       N = 12 * x;
//       g = 0;
//     } else {
//       N = x;
//     }
//   } else {
//     x = computeN();
//     N = x;
//   }
//   hasInput = 0;
//   wasresult = 1;
//   showx();
// }
// function buttonI() {
//   //TODO F

//   if (hasInput) {
//     if (g) {
//       I = x / 12;
//       g = 0;
//     } else {
//       I = x;
//     }
//   } else {
//     x = computeI();
//     wasresult = 1;
//     I = x;
//   }
//   hasInput = 0;

//   showx();
// }
// function buttonPV() {
//   //TODO F/G
//   if (hasInput) {
//     PV = x;
//   } else {
//     computePV();
//     wasresult = 1;
//   }

//   showx();
// }
// function buttonPMT() {
//   //TODO F/G

//   if (hasInput) {
//     PMT = x;
//   } else {
//     computePMT();
//     wasresult = 1;
//   }

//   showx();
// }
// function buttonFV() {
//   //TODO F/G

//   if (hasInput) {
//     FV = x;
//   } else {
//     computeFV();
//     wasresult = 1;
//   }

//   showx();
// }



// function buttonEEX() {
//   ///TODO
// }

// function buttonRunStop() {
//   ///TODO
// }

// function buttonOnOff() {
//   ///TODO
// }
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
