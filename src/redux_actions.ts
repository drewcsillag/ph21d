/// ./node_modules/.bin/webpack-serve --content ./dist --open

import {Action, State} from './interfaces';
import {AnyAction, applyMiddleware, createStore, Dispatch, Store} from 'redux';
import {reduceF} from './reduceF';
import {reduceG} from './reduceG';
import {reduceRcl} from './reduceRcl';
import {reduceRegular} from './reduceRegular';
import {reduceSto} from './reduceSto';
import {ResultState} from './util';
import Decimal from 'decimal.js';
import {runTests} from './prejest';
import {PRECISION, ZERO, INITIAL_REGS, INITIAL_FLOW_COUNTS} from './constants';
const c: Decimal.Config = {precision: PRECISION};
Decimal.set(c);

const konsole = console;
const initialState: State = {
  mDotDY: true,
  wasG: false,
  wasF: false,
  hasInput: false,
  wasResult: ResultState.NONE,
  wasSto: false,
  wasRcl: false,
  begEnd: new Decimal('0'),
  backspace: false,
  backspaceStates: [],

  dec: ZERO,

  N: ZERO,
  PV: ZERO,
  PMT: ZERO,
  I: ZERO,
  FV: ZERO,
  x: ZERO,
  lastX: ZERO,
  y: ZERO,
  stack3: ZERO,
  stack4: ZERO,
  registers: INITIAL_REGS,
  cashFlowCounts: INITIAL_FLOW_COUNTS,
};

function isNumber(x: any) {
  return typeof x === 'number';
}

export function calcApp(state = initialState, action: Action) {
  const before = state;
  const after = doReduction(state, action);
  if (
    before.wasResult === ResultState.NONE &&
    (after.wasResult !== ResultState.NONE && after.wasResult !== ResultState.ENTER)
  ) {
    const backspaceStates: State[] = [];
    return {...after, lastX: before.x, backspaceStates};
  }
  if (after.wasResult === ResultState.NONE && (isNumber(action.type) || action.type === '.')) {
    const backspaceStates = after.backspaceStates.slice();
    backspaceStates.push(after);
    return {...after, backspaceStates};
  }
  if (after.backspace) {
    const states = after.backspaceStates.slice();
    states.reverse();

    for (const backstate of states) {
      if (backstate.x !== after.x) {
        return backstate;
      }
    }

    const emptyBackendStates: State[] = [];
    return {...after, x: 0, backspace: false, backspaceStates: emptyBackendStates};
  }
  return after;
}

function doReduction(state: State, action: Action): State {
  if (action.type === 'setState') {
    return state;
  }
  if (state.wasG) {
    return reduceG(state, action);
  }
  if (state.wasF) {
    return reduceF(state, action);
  }
  if (state.wasSto) {
    return reduceSto(state, action);
  }
  if (state.wasRcl) {
    return reduceRcl(state, action);
  }
  return reduceRegular(state, action);
}

// add debug logging
function enhancer(storeToBeEnhanced: Store) {
  return (next: Dispatch<AnyAction>) => (action: any) => {
    konsole.log('dispatching', action);
    const before = storeToBeEnhanced.getState();
    // konsole.log('state before', before);
    const ret = next(action);
    const after = storeToBeEnhanced.getState();
    // konsole.log('state after', after);

    Object.keys(initialState).forEach(key => {
      if (key === 'registers') {
        for (let i = 0; i < initialState.registers.length; i++) {
          if (before.registers[i] !== after.registers[i]) {
            konsole.log(
              'register ' + i + ' changed from ' + before.registers[i] + ' to ' + after.registers[i]
            );
          }
        }
        return;
      }

      if (after[key] !== before[key]) {
        konsole.log('value of ' + key + ' changed from ' + before[key] + ' to ' + after[key]);
      }
    });
    return ret;
  };
}

export function createCalcStore() {
  return createStore(calcApp, initialState, applyMiddleware(enhancer));
}

export const store = createCalcStore();
konsole.log('store is', store);

export function buttonOnOff() {
  runTests();
}
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
export function buttonRunStop() {
  store.dispatch({type: 'runStop'});
}
export function buttonSingleStep() {
  store.dispatch({type: 'singleStep'});
}
export function buttonEEX() {
  store.dispatch({type: 'EEX'});
}
