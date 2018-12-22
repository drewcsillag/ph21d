import {createStore} from 'redux';

const initialState = {
  wasg: false,
  wasf: false,
  hasInput: false,
  wasResult: 0,
  wasSto: false,
  wasRcl: false,

  dec: 0,

  N: 0,
  PV: 0,
  PMT: 0,
  I: 0,
  FV: 0,
  x: 0,
  y: 0,
  stack3: 0,
  stack4: 0,
  registers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

function reduceG(state: any, action: any) {
  return state;
}

function reduceF(state: any, action: any) {
  return state;
}

function reduceSto(state: any, action: any) {
  let updates;
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      let registers = state.registers.slice();
      window.alert('setting reg ' + action.type + ' to ' + state.x);
      registers[action.type] = state.x;
      updates = {
        registers,
      };
      break;
    case 'N':
      updates = {
        N: state.x,
      };
      break;
    case 'I':
      updates = {
        I: state.x,
      };
      break;
    case 'PMT':
      updates = {
        PMT: state.x,
      };
      break;
    case 'FV':
      updates = {
        FV: state.x,
      };
      break;
    case 'PV':
      updates = {
        PV: state.x,
      };
      break;
    default:
    //FIXME error
    //FIXME /,+,-,* for regs 0-4
  }
  if (updates) {
    updates = Object.assign({}, updates, {
      wasSto: false,
      wasResult: 1,
    });
    console.log(updates);
    return Object.assign({}, state, updates);
  }
}

function reduceRcl(state: any, action: any) {
  let x = 0;
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      x = state.registers[action.type];
      break;
    case 'N':
      x = state.N;
      break;
    case 'I':
      x = state.I;
      break;
    case 'PMT':
      x = state.PMT;
      break;
    case 'FV':
      x = state.FV;
      break;
    case 'PV':
      x = state.PV;
      break;
    default:
    ///error;
  }
  return Object.assign({}, state, {
    x,
    wasRcl: false,
    wasResult: 1,
    hasInput: true,
  });
}

function calcApp(state = initialState, action: any) {
  if (state.wasg) {
    return reduceG(state, action);
  }
  if (state.wasf) {
    return reduceF(state, action);
  }
  if (state.wasSto) {
    return reduceSto(state, action);
  }
  if (state.wasRcl) {
    return reduceRcl(state, action);
  }
  // fixme any
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      return reduceNumber(state, action.type);
    case 'Enter':
      return Object.assign({}, state, {
        stack4: state.stack3,
        stack3: state.y,
        y: state.x,
        wasResult: 1,
      });
    case '+':
      return reduceBinaryOp(state, state.y + state.x);
    case '-':
      return reduceBinaryOp(state, state.y - state.x);
    case 'times':
      return reduceBinaryOp(state, state.y * state.x);
    case 'div':
      return reduceBinaryOp(state, state.y / state.x);
    case 'percentTotal':
      return reduceBinaryOp(state, (state.x / state.y) * 100);
    case 'percentChange':
      return reduceBinaryOp(state, ((state.x - state.y) / state.y) * 100);
    case 'percent':
      return reduceBinaryOp(state, state.y * (state.x / 100));
    case 'ytox':
      return reduceBinaryOp(state, state.y ** state.x);
    case 'clx':
      return Object.assign({}, state, {
        hasInput: false,
        x: 0,
        dec: 0,
      });
    case 'sigmaPlus':
      let registers = [
        state.registers[0],
        state.registers[1] + 1,
        state.registers[2] + state.x,
        state.registers[3] + state.x * state.x,
        state.registers[4] + state.y,
        state.registers[5] + state.y * state.y,
        state.registers[6] + state.x * state.y,
        state.registers[7],
        state.registers[8],
        state.registers[9],
      ];
      return Object.assign({}, state, {
        registers,
        wasResult: 2,
        hasInput: true,
      });
    case 'chs':
      return Object.assign({}, state, {
        x: -state.x,
      });
    case 'recipX':
      return Object.assign({}, state, {
        x: 1 / state.x,
        hasInput: true,
      });
    case 'rotateStack':
      return Object.assign({}, state, {
        x: state.y,
        y: state.stack3,
        stack3: state.stack4,
        stack4: state.x,
        hasInput: true,
      });
    case 'f':
      return Object.assign({}, state, {
        wasf: true,
      });
    case 'g':
      return Object.assign({}, state, {
        wasg: true,
      });
    case 'swapxy':
      return Object.assign({}, state, {
        x: state.y,
        y: state.x,
        hasInput: true,
      });
    case 'sto':
      return Object.assign({}, state, {
        wasSto: true,
        wasRcl: false,
      });
    case 'rcl':
      return Object.assign({}, state, {
        wasRcl: true,
        wasSto: false,
      });
    default:
      return state;
  }
}

function reduceBinaryOp(state: any, newX: number) {
  return Object.assign({}, state, {
    y: state.stack3,
    stack3: state.stack4,
    x: newX,
    hasInput: true,
    wasResult: 1,
  });
}

function reduceNumber(state: any, n: number) {
  let hasInput = 1;
  let y = state.y;
  let x = state.x;
  let wasResult = state.wasResult;
  let dec = state.dec;

  if (wasResult) {
    if (wasResult === 1) {
      y = x;
    }
    wasResult = 0;
    dec = 0;
    x = 0;
  }

  if (dec === 0) {
    x = x * 10 + n;
  } else {
    dec /= 10;
    x += dec * n;
  }
  const updates = {
    x,
    y,
    dec,
    hasInput,
    wasResult,
  };
  return Object.assign({}, state, updates);
}
export const store = createStore(calcApp);

export function button0() {
  store.dispatch({type: 0});
}
export function button1() {
  store.dispatch({type: 1});
}
export function button2() {
  store.dispatch({type: 2});
}
export function button3() {
  store.dispatch({type: 3});
}
export function button4() {
  store.dispatch({type: 4});
}
export function button5() {
  store.dispatch({type: 5});
}
export function button6() {
  store.dispatch({type: 6});
}
export function button7() {
  store.dispatch({type: 7});
}
export function button8() {
  store.dispatch({type: 8});
}
export function button9() {
  store.dispatch({type: 9});
}
export function buttonPoint() {
  store.dispatch({type: '.'});
}
export function buttonPlus() {
  store.dispatch({type: '+'});
}
export function buttonEnter() {
  store.dispatch({type: 'Enter'});
}
export function buttonMinus() {
  store.dispatch({type: '-'});
}
export function buttonTimes() {
  store.dispatch({type: 'times'});
}
export function buttonDiv() {
  store.dispatch({type: 'div'});
}
export function buttonPercentTotal() {
  store.dispatch({type: 'percentTotal'});
}
export function buttonPercentChange() {
  store.dispatch({type: 'percentChange'});
}
export function buttonPercent() {
  store.dispatch({type: 'percent'});
}
export function buttonYtoX() {
  store.dispatch({type: 'ytox'});
}
export function buttonCLx() {
  store.dispatch({type: 'clx'});
}
export function buttonSigmaPlus() {
  store.dispatch({type: 'sigmaPlus'});
}
export function buttonCHS() {
  store.dispatch({type: 'chs'});
}
export function buttonRecipX() {
  store.dispatch({type: 'recipX'});
}
export function buttonRotateStack() {
  store.dispatch({type: 'rotateStack'});
}
export function buttonF() {
  store.dispatch({type: 'f'});
}
export function buttonG() {
  store.dispatch({type: 'g'});
}
export function buttonSwapXY() {
  store.dispatch({type: 'swapxy'});
}
export function buttonSTO() {
  store.dispatch({type: 'sto'});
}
export function buttonRCL() {
  store.dispatch({type: 'rcl'});
}
export function buttonN() {
  store.dispatch({type: 'N'});
}
export function buttonI() {
  store.dispatch({type: 'I'});
}
export function buttonPV() {
  store.dispatch({type: 'PV'});
}
export function buttonPMT() {
  store.dispatch({type: 'PMT'});
}
export function buttonFV() {
  store.dispatch({type: 'FV'});
}
