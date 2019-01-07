import {createCalcStore} from './redux_actions';
import Decimal from 'decimal.js';
import {State} from './interfaces';

type nameFPair = [string, () => void];
const tests: nameFPair[] = [
  [
    'plus',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 2});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 5});
      store.dispatch({type: '+'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(7)) {
        throw 'expected 2,Enter,5,+ to be 7, but was ' + x;
      }
    },
  ],
  [
    '-',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 2});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 5});
      store.dispatch({type: '-'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(-3)) {
        throw 'expected 2,Enter,5,+ to be -3, but was ' + x;
      }
    },
  ],
  [
    'times',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 2});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 5});
      store.dispatch({type: 'times'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(10)) {
        throw 'expected 2,Enter,5,* to be 10, but was ' + x;
      }
    },
  ],
  [
    'divide',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 2});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 5});
      store.dispatch({type: 'div'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      console.log('X precision is', x.precision());
      if (!x.eq(0.4)) {
        throw 'expected 2,Enter,5,/ to be 0.4, but was ' + x;
      }
    },
  ],
];
export function runTests() {
  let fails: String[] = [];
  tests.forEach(test => {
    const [name, f] = test;
    try {
      f();
      console.log(name + ' OK');
    } catch (e) {
      console.log(name + ' FAIL');
      fails.push(name);
    }
  });
  if (fails.length != 0) {
    console.log('ERROR: there were failures:', fails);
  } else {
    console.log('SUCCESS! All tests pass!');
  }
}
