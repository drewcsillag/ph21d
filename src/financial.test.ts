import {createCalcStore} from './redux_actions';
import {Store} from 'redux';
import {initialState} from './constants';
import Decimal from 'decimal.js';
import {State} from './interfaces';

function tenN(store: Store) {
  store.dispatch({type: 1});
  store.dispatch({type: 0});
  store.dispatch({type: 'N'});
}

function fiveI(store: Store) {
  store.dispatch({type: 5});
  store.dispatch({type: 'I'});
}

function thousandPV(store: Store) {
  store.dispatch({type: 1});
  store.dispatch({type: 0});
  store.dispatch({type: 0});
  store.dispatch({type: 0});
  store.dispatch({type: 'PV'});
}

function fiveHundredFV(store: Store) {
  store.dispatch({type: 5});
  store.dispatch({type: 0});
  store.dispatch({type: 0});
  store.dispatch({type: 'FV'});
}

function approxPMT(store: Store) {
  store.dispatch({type: 1});
  store.dispatch({type: 6});
  store.dispatch({type: 9});
  store.dispatch({type: '.'});
  store.dispatch({type: 2});
  store.dispatch({type: 5});
  store.dispatch({type: 7});
  store.dispatch({type: 'chs'});
  store.dispatch({type: 'PMT'});
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
  store.dispatch({type: 1});
  store.dispatch({type: 6});
  store.dispatch({type: 9});
  store.dispatch({type: '.'});
  store.dispatch({type: 2});
  store.dispatch({type: 5});
  store.dispatch({type: 7});
  store.dispatch({type: 'chs'});
  store.dispatch({type: 'PMT'});
  store.dispatch({type: 'PV'});
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(1000.001062, 5);
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

  store.dispatch({type: 1});
  store.dispatch({type: 0});
  store.dispatch({type: 0});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'PV'}); // CF0
  store.dispatch({type: 3});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'FV'}); // Nj
  store.dispatch({type: 2});
  store.dispatch({type: 0});
  store.dispatch({type: 0});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'PMT'}); // CFj
  store.dispatch({type: 'f'});
  store.dispatch({type: 'PV'}); //NPV
  // console.log('NPV state is:', state.N, state.registers, state.cashFlowCounts);
  expect((store.getState() as State).x.toNumber()).toBeCloseTo(458.7085628, 7);
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
  store.dispatch({type: 5});
  store.dispatch({type: 'N'});
  thousandPV(store);
  fiveHundredFV(store);
  store.dispatch({type: 1});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percentTotal'});
  expect((store.getState().x as Decimal).toNumber()).toBe(100);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBe(400);
  store.dispatch({type: 2});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percentTotal'});
  expect((store.getState().x as Decimal).toNumber()).toBe(100);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBe(300);
});

test('depreciation soyd', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'N'});
  thousandPV(store);
  fiveHundredFV(store);
  store.dispatch({type: 1});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percentChange'});
  expect((store.getState().x as Decimal).toNumber()).toBeCloseTo(166.6666667, 7);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBeCloseTo(333.3333333, 7);
  store.dispatch({type: 2});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percentChange'});
  expect((store.getState().x as Decimal).toNumber()).toBeCloseTo(133.3333333, 7);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBeCloseTo(200, 7);
});

test('depreciation db', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'N'});
  thousandPV(store);
  fiveHundredFV(store);
  store.dispatch({type: 1});
  store.dispatch({type: 2});
  store.dispatch({type: 5});
  store.dispatch({type: 'I'});
  store.dispatch({type: 1});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percent'});
  expect((store.getState().x as Decimal).toNumber()).toBe(250);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBe(250);
  store.dispatch({type: 2});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percent'});
  expect((store.getState().x as Decimal).toNumber()).toBe(187.5);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBe(62.5);
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
