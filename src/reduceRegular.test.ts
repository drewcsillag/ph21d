import Decimal from 'decimal.js';
import {State} from './interfaces';
import {createCalcStore} from './redux_actions';

test('subtraction', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: '-'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(-3);
});

test('addition', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: '+'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(7);
});

test('multiplication', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: 'times'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(10);
});

test('division', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: 'div'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(0.4);
});

test('reciprocal', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'recipX'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(0.5);
});

test('percent', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'percent'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(0.1);
  expect(state.y.toNumber()).toBe(5);
});

test('percentTotalTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'percentTotal'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(40);
  expect(state.y.toNumber()).toBe(5);
  store.dispatch({type: 'clx'});
  store.dispatch({type: 3});
  store.dispatch({type: 'percentTotal'});
  expect(store.getState().x.toNumber()).toBe(60);
});

test('percentChangeTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'percentChange'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(-60);
  expect(state.y.toNumber()).toBe(5);
});

test('exponentiationTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'ytox'});
  const state: State = store.getState();
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(25);
});

test('chsTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 0});
  store.dispatch({type: 'chs'});
  let state: State = store.getState();
  let x: Decimal = state.x;
  expect(x.toNumber()).toBe(-50);
  store.dispatch({type: 'chs'});
  state = store.getState();
  x = state.x;
  expect(x.toNumber()).toBe(50);
});

test('decimalPoint', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: '.'});
  store.dispatch({type: 5});
  expect(store.getState().x.toNumber()).toBe(5.5);
  store.dispatch({type: '.'}); // should be ignored
  store.dispatch({type: 2});
  store.dispatch({type: 5});
  expect(store.getState().x.toNumber()).toBe(5.525);
});
// RND
// EEX
// F-number to change display
