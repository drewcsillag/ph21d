import {createCalcStore} from './redux_actions';
import Decimal from 'decimal.js';
import {State} from './interfaces';
// import {
//   computePMTTest,
//   computeFVTest,
//   computePVTest,
//   computeITest,
//   computeNTest,
// } from './financialtests';
import {testStatsRegisterStates, testMean, testStdDev, testHats} from './statstests';

// const tests: Map<string, ()=>void> = new Map();

// tests['plus'] = () => {
//     const store = createCalcStore();
//     store.dispatch({type: 2});
//     store.dispatch({type: 'Enter'});
//     store.dispatch({type: 5});
//     store.dispatch({type: '+'});
//     const state: State = store.getState() as State;
//     const x: Decimal = state.x;
//     //   const x = store.getState().x;
//     if (!x.eq(7)) {
//       throw 'expected 2,Enter,5,+ to be 7, but was ' + x;
//     }
//   }
// };
//   computePMTTest,
//   computeFVTest,
//   computePVTest,
//   computeITest,
//   computeNTest,
//   testStatsRegisterStates,
//   testMean,
//   testStdDev,
//   testHats,
//   };

export function runTests() {}
//   let fails: String[] = [];
//   for (var name in tests) {
//     const f = tests[name];
// //   tests.forEach(test => {
//     // const [name, f] = test;
//     try {
//       f();
//       console.log(name + ' OK');
//     } catch (e) {
//       console.log(name + ' FAIL');
//       fails.push('FAIL: ' + name + ': ' + e);
//     }
//   });
//   if (fails.length != 0) {
//     console.log('ERROR: ' + fails.length + '/' + tests.length + ' failed:', fails);
//     window.alert('ERROR: ' + fails.length + '/' + tests.length + ' failed:\n' + fails.join('\n'));
//   } else {
//     console.log('SUCCESS! All tests pass!');
//     window.alert('SUCCESS! All tests pass!');
//   }
// }
