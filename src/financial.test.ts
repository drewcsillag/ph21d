import {createCalcStore, store} from './redux_actions';
import {Store} from 'redux';
import {initialState} from './constants';
import Decimal from 'decimal.js';
import {State, ActionType, Action} from './interfaces';

function tenN(store: Store) {
  dispatch(store, 1, 0, 'N');
}

function fiveI(store: Store) {
  dispatch(store, 5, 'I');
}

function thousandPV(store: Store) {
  dispatch(store, 1, 0, 0, 0, 'PV');
}

function fiveHundredFV(store: Store) {
  dispatch(store, 5, 0, 0, 'FV');
}

function approxPMT(store: Store) {
  dispatch(store, 1, 6, 9, '.', 2, 5, 7, 'chs', 'PMT');
}

test('computePMT', () => {
  const store = createCalcStore();
  tenN(store);
  fiveI(store);
  thousandPV(store);
  fiveHundredFV(store);
  store.dispatch({type: 'PMT'});
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(-169.2568624, 7);
});

test('computeFVTest', () => {
  const store = createCalcStore();
  tenN(store);
  fiveI(store);
  thousandPV(store);
  approxPMT(store);
  store.dispatch({type: 'FV'});
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(500.0017301, 7);
});

test('computePVTest', () => {
  const store = createCalcStore();
  tenN(store);
  fiveI(store);
  fiveHundredFV(store);
  approxPMT(store);
  dispatch(store, 'PV');
  expect(getX(store)).toBeCloseTo(1000.001062, 5);
});

test('computeITest', () => {
  const store = createCalcStore();
  tenN(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'I'});
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(5, 7);
});

test('computeNTest', () => {
  const store = createCalcStore();
  fiveI(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'N'});
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(10, 7);
});

test('cashflowsNPV', () => {
  const store = createCalcStore();

  fiveI(store);
  dispatch(store, 1, 0, 0, 'g', 'PV');
  dispatch(store, 3, 'g', 'FV');
  dispatch(store, 2, 0, 0, 'g', 'PMT');
  dispatch(store, 'f', 'PV');
  expect(getX(store)).toBeCloseTo(458.7085628, 7);
});

function getX(store: Store): number {
  return (store.getState() as State).x.toNumber();
}

test('cashflowsNPV2', () => {
  const store = createCalcStore();
  dispatch(store, 8, 0, 0, 0, 0, 'chs', 'g', 'PV');
  dispatch(store, 5, 0, 0, 'chs', 'g', 'PMT');
  dispatch(store, 4, 5, 0, 0, 'g', 'PMT');
  dispatch(store, 5, 5, 0, 0, 'g', 'PMT');
  dispatch(store, 4, 5, 0, 0, 'g', 'PMT');
  dispatch(store, 1, 3, 0, 0, 0, 0, 'g', 'PMT');
  dispatch(store, 'rcl', 'N');
  expect(getX(store)).toBe(5.0);
  dispatch(store, 1, 3, 'I');
  dispatch(store, 'f', 'PV');
  expect(getX(store)).toBeCloseTo(212.18);
});

test('cashflowsIRR', () => {
  console.log('IRR Start--------------');
  const store = createCalcStore();
  // rather than "push" a bunch of buttons, just load up the state
  const registers = initialState.registers.slice();
  registers[0] = new Decimal(100);
  registers[1] = new Decimal(200);
  registers[2] = new Decimal(-550);
  const cashFlowCounts = initialState.cashFlowCounts.slice();
  cashFlowCounts[0] = new Decimal(3);
  store.dispatch({
    type: 'setState',
    value: {...initialState, registers, cashFlowCounts, N: new Decimal(2), I: new Decimal(5)},
  });

  store.dispatch({type: 'FV'}); //IRR
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(4.368170057, 7);
});

test('depreciation sl', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'N');
  thousandPV(store);
  fiveHundredFV(store);
  dispatch(store, 1, 'f', 'percentTotal');
  expect(getX(store)).toBe(100);

  dispatch(store, 'swapxy');
  expect(getX(store)).toBe(400);

  dispatch(store, 2, 'f', 'percentTotal');
  expect(getX(store)).toBe(100);

  store.dispatch({type: 'swapxy'});
  expect(getX(store)).toBe(300);
});

test('depreciation soyd', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'N');
  thousandPV(store);
  fiveHundredFV(store);
  dispatch(store, 1, 'f', 'percentChange');
  expect(getX(store)).toBeCloseTo(166.6666667, 7);

  dispatch(store, 'swapxy');
  expect(getX(store)).toBeCloseTo(333.3333333, 7);

  dispatch(store, 2, 'f', 'percentChange');
  expect(getX(store)).toBeCloseTo(133.3333333, 7);

  dispatch(store, 'swapxy');
  expect(getX(store)).toBeCloseTo(200, 7);
});

test('depreciation db', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'N');
  thousandPV(store);
  fiveHundredFV(store);
  dispatch(store, 1, 2, 5, 'I');
  dispatch(store, 1, 'f', 'percent');
  expect(getX(store)).toBe(250);

  dispatch(store, 'swapxy');
  expect(getX(store)).toBe(250);

  dispatch(store, 2, 'f', 'percent');
  expect(getX(store)).toBe(187.5);

  dispatch(store, 'swapxy');
  expect(getX(store)).toBe(62.5);
});

function dispatch(store: Store, ...actions: ActionType[]) {
  actions.forEach(action => store.dispatch({type: action}));
}

test('begendLoan', () => {
  const store = createCalcStore();
  dispatch(store, 'g', 7, 1, 0, 'N', 5, 'I', 1, 0, 0, 0, 'PV', 'PMT');
  expect(getX(store)).toBeCloseTo(-123.3376904, 6);
  dispatch(store, 'g', 8, 1, 0, 'N', 5, 'I', 1, 0, 0, 0, 'PV', 'PMT');
  expect(getX(store)).toBeCloseTo(-129.504575, 6);
});

//bond price
//bond ytm
//amort
//int

//depreciation: handle 0s as state.x and partial first years
// deprec soyd partial first year
// deprec db partial first year
// deprec SL partial first year

//reviewing & editing cash flows
