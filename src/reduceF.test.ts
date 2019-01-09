import {createCalcStore} from './redux_actions';
import {initialState, ONE, ZERO} from './constants';
import Decimal from 'decimal.js';
import {start} from 'repl';

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
  const starting = {...initialState, registers};
  store.dispatch({type: 'setState', value: starting});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'singleStep'});
  const after = store.getState().registers;
  for (let i = 0; i < 20; i++) {
    if (i >= 1 && i <= 6) {
      expect(after[i]).toBe(ZERO);
    } else {
      expect(after[i]).toBe(ONE);
    }
  }
});

test('finclear', () => {
  const store = createCalcStore();
  const starting = {...initialState, I: ONE, N: ONE, PV: ONE, PMT: ONE, FV: ONE};
  store.dispatch({type: 'setState', value: starting});
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
  const starting = {...initialState, registers};
  store.dispatch({type: 'setState', value: starting});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'clx'});
  const after = store.getState().registers;
  for (let i = 0; i < 20; i++) {
    expect(after[i]).toBe(ZERO);
  }
});

// program clear
