import {createCalcStore} from './redux_actions';
import {dispatch} from './util';

test('decimal', () => {
  const store = createCalcStore();
  dispatch(store, '.', 5);
  expect(store.getState().x.toNumber()).toBe(0.5);
  dispatch(store, 'clx', '.', 5);
  expect(store.getState().x.toNumber()).toBe(0.5);
});

test('subtraction', () => {
  const store = createCalcStore();
  dispatch(store, 2, 'Enter', 5, '-');
  expect(store.getState().x.toNumber()).toBe(-3);
});

test('addition', () => {
  const store = createCalcStore();
  dispatch(store, 2, 'Enter', 5, '+');
  expect(store.getState().x.toNumber()).toBe(7);
});

test('multiplication', () => {
  const store = createCalcStore();
  dispatch(store, 2, 'Enter', 5, 'times');
  expect(store.getState().x.toNumber()).toBe(10);
});

test('division', () => {
  const store = createCalcStore();
  dispatch(store, 2, 'Enter', 5, 'div');
  expect(store.getState().x.toNumber()).toBe(0.4);
});

test('reciprocal', () => {
  const store = createCalcStore();
  dispatch(store, 2, 'recipX');
  expect(store.getState().x.toNumber()).toBe(0.5);
});

test('percent', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'Enter', 2, 'percent');
  expect(store.getState().x.toNumber()).toBe(0.1);
  expect(store.getState().y.toNumber()).toBe(5);
});

test('percentTotalTest', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'Enter', 2, 'percentTotal');
  expect(store.getState().x.toNumber()).toBe(40);
  expect(store.getState().y.toNumber()).toBe(5);
  dispatch(store, 'clx', 3, 'percentTotal');
  expect(store.getState().x.toNumber()).toBe(60);
});

test('percentChangeTest', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'Enter', 2, 'percentChange');
  expect(store.getState().x.toNumber()).toBe(-60);
  expect(store.getState().y.toNumber()).toBe(5);
});

test('exponentiationTest', () => {
  const store = createCalcStore();
  dispatch(store, 5, 'Enter', 2, 'ytox');
  expect(store.getState().x.toNumber()).toBe(25);
});

test('chsTest', () => {
  const store = createCalcStore();
  dispatch(store, 5, 0, 'chs');
  expect(store.getState().x.toNumber()).toBe(-50);
  dispatch(store, 'chs');
  expect(store.getState().x.toNumber()).toBe(50);
});

test('decimalPoint', () => {
  const store = createCalcStore();
  dispatch(store, 5, '.', 5);
  expect(store.getState().x.toNumber()).toBe(5.5);
  dispatch(store, '.', 2, 5); // '.' should be ignored
});
// RND
// EEX
// F-number to change display
