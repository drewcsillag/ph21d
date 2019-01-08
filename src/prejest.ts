import {createCalcStore} from './redux_actions';
import Decimal from 'decimal.js';
import {State} from './interfaces';
import {
  computePMTTest,
  computeFVTest,
  computePVTest,
  computeITest,
  computeNTest,
} from './financialtests';
import {testStatsRegisterStates, testMean, testStdDev, testHats} from './statstests';

const tests = {
  plus: () => {
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
  '-': () => {
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
  times: () => {
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
  divide: () => {
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
  recipXTest: () => {
    const store = createCalcStore();
    store.dispatch({type: 2});
    store.dispatch({type: 'recipX'});
    const state: State = store.getState() as State;
    const x: Decimal = state.x;
    if (!x.eq(0.5)) {
      throw 'expected 2,recipX to be .5 but was ' + x;
    }
  },
  percentTest: () => {
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
  percentTotalTest: () => {
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
  percentChangeTest: () => {
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
  percentChangeTest: () => {
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
  chsTest: () => {
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
  computePMTTest,
  computeFVTest,
  computePVTest,
  computeITest,
  computeNTest,
  testStatsRegisterStates,
  testMean,
  testStdDev,
  testHats,
};

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
    window.alert('ERROR: ' + fails.length + '/' + tests.length + ' failed:\n' + fails.join('\n'));
  } else {
    console.log('SUCCESS! All tests pass!');
    window.alert('SUCCESS! All tests pass!');
  }
}
