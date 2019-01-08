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
      //   const x = store.getState().x;
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
  [
    'recipXTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 2});
      store.dispatch({type: 'recipX'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(0.5)) {
        throw 'expected 2,recipX to be .5 but was ' + x;
      }
    },
  ],
  [
    'percentTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 5});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 2});
      store.dispatch({type: 'percent'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(0.1)) {
        throw 'expected 5,Enter,2,percent to be .1 but was ' + x;
      }
    },
  ],
  [
    'percentTotalTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 5});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 2});
      store.dispatch({type: 'percentTotal'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(40)) {
        throw 'expected 5,Enter,2,percentTotal to be 40 but was ' + x;
      }
    },
  ],
  [
    'percentChangeTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 5});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 2});
      store.dispatch({type: 'percentChange'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(-60)) {
        throw 'expected 5,Enter,2,percentChange to be -60 but was ' + x;
      }
    },
  ],
  [
    'percentChangeTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 5});
      store.dispatch({type: 'Enter'});
      store.dispatch({type: 2});
      store.dispatch({type: 'ytox'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (!x.eq(25)) {
        throw 'expected 5,Enter,2,ytox to be 25 but was ' + x;
      }
    },
  ],
  [
    'chsTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 5});
      store.dispatch({type: 0});
      store.dispatch({type: 'chs'});
      let state: State = store.getState() as State;
      let x: Decimal = state.x;
      if (!x.eq(-50)) {
        throw 'expected 50,CHS to be -50 but was  ' + x;
      }
      store.dispatch({type: 'chs'});
      state = store.getState() as State;
      x = state.x;
      if (!x.eq(50)) {
        throw 'expected 50,CHS to be -50 but was  ' + x;
      }
    },
  ],
  [
    'computePMTTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 1});
      store.dispatch({type: 0});
      store.dispatch({type: 'N'});
      store.dispatch({type: 5});
      store.dispatch({type: 'I'});
      store.dispatch({type: 1});
      store.dispatch({type: 0});
      store.dispatch({type: 0});
      store.dispatch({type: 0});
      store.dispatch({type: 'PV'});
      store.dispatch({type: 5});
      store.dispatch({type: 0});
      store.dispatch({type: 0});
      store.dispatch({type: 'FV'});
      store.dispatch({type: 'PMT'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (
        !x
          .minus(-169.2568624)
          .abs()
          .lessThan(0.0000001)
      ) {
        throw 'expected 10,N,5,I,1000,PV,500,FV,PMT to be about -169.2568624 but was ' + x;
      }
    },
  ],
  [
    'computeFVTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 1});
      store.dispatch({type: 0});
      store.dispatch({type: 'N'});
      store.dispatch({type: 5});
      store.dispatch({type: 'I'});
      store.dispatch({type: 1});
      store.dispatch({type: 0});
      store.dispatch({type: 0});
      store.dispatch({type: 0});
      store.dispatch({type: 'PV'});
      store.dispatch({type: 1});
      store.dispatch({type: 6});
      store.dispatch({type: 9});
      store.dispatch({type: '.'});
      store.dispatch({type: 2});
      store.dispatch({type: 5});
      store.dispatch({type: 7});
      store.dispatch({type: 'chs'});
      store.dispatch({type: 'PMT'});
      store.dispatch({type: 'FV'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (
        !x
          .minus(500.0017301)
          .abs()
          .lessThan(0.0000001)
      ) {
        throw 'expected 10,N,5,I,1000,PV,-169.257,PMT,FV to be about 500.017301 but was ' + x;
      }
    },
  ],
  [
    'computePVTest',
    () => {
      const store = createCalcStore();
      store.dispatch({type: 1});
      store.dispatch({type: 0});
      store.dispatch({type: 'N'});
      store.dispatch({type: 5});
      store.dispatch({type: 'I'});
      store.dispatch({type: 1});
      store.dispatch({type: 6});
      store.dispatch({type: 9});
      store.dispatch({type: '.'});
      store.dispatch({type: 2});
      store.dispatch({type: 5});
      store.dispatch({type: 7});
      store.dispatch({type: 'chs'});
      store.dispatch({type: 'PMT'});
      store.dispatch({type: 5});
      store.dispatch({type: 0});
      store.dispatch({type: 0});
      store.dispatch({type: 'FV'});
      store.dispatch({type: 'PV'});
      const state: State = store.getState() as State;
      const x: Decimal = state.x;
      if (
        !x
          .minus(1000.101445)
          .abs()
          .lessThan(0.0000001)
      ) {
        throw 'expected 10,N,5,I,500,-169.257,PMT,500,FV,PV to be about 1000.101445 but was ' + x;
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
      fails.push('FAIL: ' + name + ': ' + e);
    }
  });
  if (fails.length != 0) {
    console.log('ERROR: ' + fails.length + '/' + tests.length + ' failed:', fails);
  } else {
    console.log('SUCCESS! All tests pass!');
  }
}
