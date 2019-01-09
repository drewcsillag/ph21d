import {createCalcStore} from './redux_actions';
import {Store} from 'redux';
import {expectXAbout} from './testutils';
import {initialState} from './constants';
import Decimal from 'decimal.js';

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
  expectXAbout(store, -169.2568624, '10,N,5,I,1000,PV,500,FV,PMT');
});

test('computeFVTest', () => {
  const store = createCalcStore();
  tenN(store);
  fiveI(store);
  thousandPV(store);
  approxPMT(store);
  store.dispatch({type: 'FV'});
  expectXAbout(store, 500.0017301, '0,N,5,I,1000,PV,-169.257,PMT,FV');
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
  expectXAbout(store, 1000.101445, '10,N,5,I,500,FV,-169.257,PMT,500,FV,PV');
});
test('computeITest', () => {
  const store = createCalcStore();
  tenN(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'I'});
  expectXAbout(store, 5, '10,N,500,FV,1000,PV,-169.257,PMT,I');
});

test('computeNTest', () => {
  const store = createCalcStore();
  fiveI(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'N'});
  expectXAbout(store, 10, '5,I,500,FV,1000,PV,-169.257,PMT,N');
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
  expectXAbout(store, 458.7085628, 'NPV');
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
  expectXAbout(store, 4.368170057, 'NPV');
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
  store.dispatch({type: 'percentChange'});
  expect((store.getState().x as Decimal).toNumber()).toBe(250);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBe(250);
  store.dispatch({type: 2});
  store.dispatch({type: 'f'});
  store.dispatch({type: 'percentTotal'});
  expect((store.getState().x as Decimal).toNumber()).toBe(187.5);
  store.dispatch({type: 'swapxy'});
  expect((store.getState().x as Decimal).toNumber()).toBe(62.5);
});

//bond price
//bond ytm
//amort
//int

//reviewing & editing cash flows
