import {createCalcStore} from './redux_actions';
import {expectXAbout} from './testutils';

test('sqrt', () => {
  const store = createCalcStore();
  store.dispatch({type: 2});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'ytox'});
  expectXAbout(store, 1.414213562, 'sqrt(2)');
});

test('etox', () => {
  const store = createCalcStore();
  store.dispatch({type: 1});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'recipX'});
  expectXAbout(store, 2.718281828, 'exp(1)');
});

test('ln', () => {
  const store = createCalcStore();
  store.dispatch({type: 1});
  store.dispatch({type: 0});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'percentTotal'});
  expectXAbout(store, 2.302585093, 'ln(10)');
});

test('frac', () => {
  const store = createCalcStore();
  store.dispatch({type: 1});
  store.dispatch({type: '.'});
  store.dispatch({type: 3});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'percentChange'});
  expectXAbout(store, 0.3, 'frac(1.3)');
  store.dispatch({type: 1});
  store.dispatch({type: '.'});
  store.dispatch({type: 3});
  store.dispatch({type: 'chs'});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'percentChange'});
  expectXAbout(store, -0.3, 'frac(-1.3)');
});

test('intg', () => {
  const store = createCalcStore();
  store.dispatch({type: 1});
  store.dispatch({type: '.'});
  store.dispatch({type: 3});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'percent'});
  expectXAbout(store, 1, 'intg(1.3)');
  store.dispatch({type: 1});
  store.dispatch({type: '.'});
  store.dispatch({type: 3});
  store.dispatch({type: 'chs'});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'percent'});
  expectXAbout(store, -1, 'intg(-1.3)');
});
