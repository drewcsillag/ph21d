import {createCalcStore} from './redux_actions';
import {Store} from 'redux';
import {initialState, ONE, NEG_ONE} from './constants';
import Decimal from 'decimal.js';
import {State, ActionType} from './interfaces';
import {frac, mul, add, intg, sub, div} from './util';
import {computeCompoundInterest} from './interest';

function getX(store: Store): number {
  return (store.getState() as State).x.toNumber();
}

function dispatch(store: Store, ...actions: ActionType[]) {
  actions.forEach(action => store.dispatch({type: action}));
}

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
  expect(getX(store)).toBeCloseTo(-169.2568624, 7);
});

test('computeFVTest', () => {
  const store = createCalcStore();
  tenN(store);
  fiveI(store);
  thousandPV(store);
  approxPMT(store);
  store.dispatch({type: 'FV'});
  expect(getX(store)).toBeCloseTo(500.0017301, 7);
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
  dispatch(store, 6, 0, 'N');
  dispatch(store, 2, 0, 0, 0, 0, 'PV');
  dispatch(store, 4, 4, 5, '.', 3, 2, 'chs', 'PMT');
  dispatch(store, 'I');
  dispatch(store, 'rcl', 'g', 'I');
  expect(getX(store)).toBeCloseTo(12.04263787, 2);
});

test('computeNWouldBeFractional', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'I');
  dispatch(store, 1, 0, 0, 0, 'PV');
  dispatch(store, 2, 3, 6, '.', 7, 4, 9, 1, 6, 8, 1, 'chs', 'PMT');
  dispatch(store, 'N');
  expect(getX(store)).toBe(5);
});

test('computeNTest', () => {
  const store = createCalcStore();
  fiveI(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'N'});
  expect(getX(store)).toBeCloseTo(10, 7);
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

test('cashflowsNPV3', () => {
  const store = createCalcStore();

  dispatch(store, 4, '.', 3, 6, 8, 1, 7, 0, 0, 5, 7, 'I');
  dispatch(store, 1, 0, 0, 'g', 'PV');
  dispatch(store, 3, 'g', 'FV');
  dispatch(store, 2, 0, 0, 'g', 'PMT');
  dispatch(store, 5, 5, 0, 'chs', 'g', 'PMT');
  dispatch(store, 'f', 'PV');
  expect(getX(store)).toBeCloseTo(0, 7);
});

test('cashflowsIRR', () => {
  console.log('IRR Start--------------');
  const store = createCalcStore();
  dispatch(store, 1, 0, 0, 'g', 'PV');
  dispatch(store, 3, 'g', 'FV');
  dispatch(store, 2, 0, 0, 'g', 'PMT');
  dispatch(store, 5, 5, 0, 'chs', 'g', 'PMT');
  // dispatch(store, 5, 'I');
  dispatch(store, 'f', 'FV'); //IRR
  expect(getX(store)).toBeCloseTo(4.368170057, 7);
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
