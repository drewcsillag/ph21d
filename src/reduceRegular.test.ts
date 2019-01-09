import {createCalcStore} from './redux_actions';
import {State} from './interfaces';
import Decimal from 'decimal.js';

test('subtraction', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: '-'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(-3);
});

test('addition', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: '+'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(7);
});

test('multiplication', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: 'times'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(10);
});

test('division', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 5});
  store.dispatch({type: 'div'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(0.4);
});

test('reciprocal', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'recipX'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(0.5);
});

test('percent', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'percent'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(0.1);
});

test('percentTotalTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'percentTotal'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(40);
});

test('percentChangeTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'percentChange'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(-60);
});

test('exponentiationTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 2});
  store.dispatch({type: 'ytox'});
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(x.toNumber()).toBe(25);
});

test('chsTest', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 0});
  store.dispatch({type: 'chs'});
  let state: State = store.getState() as State;
  let x: Decimal = state.x;
  expect(x.toNumber()).toBe(-50);
  store.dispatch({type: 'chs'});
  state = store.getState() as State;
  x = state.x;
  expect(x.toNumber()).toBe(50);
});
