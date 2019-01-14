/// ./node_modules/.bin/webpack-serve --content ./dist --open

import {Action, State, ResultState, ProgramWord} from './interfaces';
import {AnyAction, applyMiddleware, createStore, Dispatch, Store, Reducer} from 'redux';
import {reduceF} from './reduceF';
import {reduceG, reduceGGto} from './reduceG';
import {reduceRcl} from './reduceRcl';
import {reduceRegular} from './reduceRegular';
import {reduceSto} from './reduceSto';
import Decimal from 'decimal.js';
import {initialState, ZERO} from './constants';
import {reduceProgramMode, programRunner} from './reduceProgramMode';
import {isUndefined} from 'util';
import {dispatch} from './util';

const c: Decimal.Config = {precision: 40};
Decimal.set(c);

const konsole = console;

function isNumber(x: any) {
  return typeof x === 'number';
}

export function calcApp(inState: State = initialState, action: Action): State {
  const state: State = {...inState, displaySpecial: null};
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
    if (!after.hasInput) {
      return {...after, x: ZERO};
    }
    const states = after.backspaceStates.slice();
    states.reverse();

    for (const backstate of states) {
      if (backstate.x !== after.x) {
        return backstate;
      }
    }

    const emptyBackendStates: State[] = [];
    return {...after, x: ZERO, backspace: false, backspaceStates: emptyBackendStates};
  }
  return after;
}

function doReduction(state: State, action: Action): State {
  if (action.type === 'setState') {
    return action.value;
  }
  if (state.error != null) {
    return {...state, error: null};
  }
  if (state.programMode) {
    return reduceProgramMode(state, action);
  }
  if (state.wasGto) {
    return reduceGGto(state, action);
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

function renderWord(a: ProgramWord) {
  if (isUndefined(a)) {
    return 'undefined';
  }
  return (
    '{' +
    a.arg1 +
    (a.arg2 === null ? '' : ',' + a.arg2 + (a.arg3 === null ? '' : ',' + a.arg3)) +
    '}'
  );
}
// add debug logging
function enhancer(storeToBeEnhanced: Store) {
  return (next: Dispatch<AnyAction>) => (action: any) => {
    const messages = [];
    messages.push('dispatching :' + action.type);
    const before = storeToBeEnhanced.getState();
    // konsole.log('state before', before);
    const ret = next(action);
    const after = storeToBeEnhanced.getState();
    // konsole.log('state after', after);

    Object.keys(initialState).forEach(key => {
      if (key === 'registers') {
        for (let i = 0; i < initialState.registers.length; i++) {
          if (before.registers[i] !== after.registers[i]) {
            messages.push(
              'register ' + i + ' changed from ' + before.registers[i] + ' to ' + after.registers[i]
            );
          }
        }
        return;
      }
      if (key === 'programMemory') {
        //can miss things as memory extends
        for (let i = 0; i < before.programMemory.length; i++) {
          if (before.programMemory[i] !== after.programMemory[i]) {
            const b = before.programMemory[i];
            const a = after.programMemory[i];

            messages.push(
              'program line ' + i + ' changed from ' + renderWord(b) + ' to ' + renderWord(a)
            );
          }
        }
        return;
      }

      if (after[key] !== before[key]) {
        messages.push('value of ' + key + ' changed from ' + before[key] + ' to ' + after[key]);
      }
    });
    console.log(messages.join('\n'));
    return ret;
  };
}

const f: Reducer<State, Action> = calcApp;
export function createCalcStore(state = initialState): Store<State, Action> {
  return createStore(f, state, applyMiddleware(enhancer));
}

export const store: Store<State, Action> = createCalcStore();
konsole.log('store is', store);

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
  const state: State = store.getState();
  if (state.programRunning && programInterval === null) {
    let startInterval = true;
    programRunner(store, 10, true, () => {
      startInterval = false;
    });
    if (startInterval) {
      programInterval = setInterval(programRunner, 100, store, 10, true, () => {
        clearInterval(programInterval);
        programInterval = null;
      });
    }
  }
}
export function buttonSingleStep() {
  const state: State = store.getState();
  if (!state.programRunning && !state.programMode) {
    programRunner(store, 1, false, () => {});
  } else {
    store.dispatch({type: 'singleStep'});
  }
}
export function buttonEEX() {
  store.dispatch({type: 'EEX'});
}

let programInterval: any = null; //bleah on any

dispatch(store, 'f', 'runStop', 'f', 'rotateStack');
dispatch(store, 'rcl', 0, 'swapxy', 'g', 'swapxy', 'g', 'rotateStack', 0, 7);
dispatch(store, 'rcl', 2, 'g', 'rotateStack', 0, 8, 'rcl', 1, 'percent', 'f', 'runStop');
dispatch(store, 2, 0, 0, 0, 0, 'sto', 0, 2, 0, 'sto', 1, 2, 5, 'sto', 2, 1, 5, 0, 0, 0);
// _global.store = store;
// _global.programRunner = programRunner;
// setInterval(programRunner, 1000, store, 10, true);
