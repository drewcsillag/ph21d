import {createCalcStore} from './redux_actions';
import {initialState, ONE, ZERO, TWELVE} from './constants';
import Decimal from 'decimal.js';
import {start} from 'repl';
import {State} from './interfaces';

// test sigma clear
// test fin clear
// test reg clear
// test prefix clear

// test prgm clear

test('sigmaclear', () => {
  const store = createCalcStore();
  const registers: Decimal[] = [
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
  ];
  const starting = {...initialState, registers, x: TWELVE, y: TWELVE, z: TWELVE, t: TWELVE};
  store.dispatch({type: 'setState', value: starting});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'singleStep'});
  const afterState = store.getState();
  const after = afterState.registers;
  for (let i = 0; i < 20; i++) {
    if (i >= 1 && i <= 6) {
      expect(after[i]).toBe(ZERO);
    } else {
      expect(after[i]).toBe(ONE);
    }
  }
  expect(afterState.x).toBe(ZERO);
  expect(afterState.y).toBe(ZERO);
  expect(afterState.z).toBe(ZERO);
  expect(afterState.t).toBe(ZERO);
});

test('finclear', () => {
  const store = createCalcStore({...initialState, I: ONE, N: ONE, PV: ONE, PMT: ONE, FV: ONE});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'swapxy'});
  const state = store.getState();
  expect(state.I).toBe(ZERO);
  expect(state.N).toBe(ZERO);
  expect(state.PV).toBe(ZERO);
  expect(state.PMT).toBe(ZERO);
  expect(state.FV).toBe(ZERO);
});

test('regsclear', () => {
  const registers: Decimal[] = [
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
    ONE,
  ];
  const store = createCalcStore({...initialState, registers});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'clx'});
  const after = store.getState().registers;
  for (let i = 0; i < 20; i++) {
    expect(after[i]).toBe(ZERO);
  }
});

test('prefixclear', () => {
  const store = createCalcStore({
    ...initialState,
    wasSto: true,
    wasRcl: true,
    wasGto: true,
    wasF: true,
    wasG: true,
  });
  store.dispatch({type: 'f'});
  store.dispatch({type: 'Enter'});

  expect(store.getState().wasSto).toBeFalsy();
  expect(store.getState().wasRcl).toBeFalsy();
  expect(store.getState().wasF).toBeFalsy();
  expect(store.getState().wasG).toBeFalsy();
  expect(store.getState().wasGto).toBeFalsy();
});
// program clear
