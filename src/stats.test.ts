import {createCalcStore} from './redux_actions';
import {Store} from 'redux';
import {expectXAbout} from './testutils';

function inputData(store: Store) {
  store.dispatch({type: 1});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 0});
  store.dispatch({type: 'sigmaPlus'});
  store.dispatch({type: 2});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 1});
  store.dispatch({type: '.'});
  store.dispatch({type: 5});
  store.dispatch({type: 'sigmaPlus'});
  store.dispatch({type: 3});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 3});
  store.dispatch({type: 'sigmaPlus'});
  store.dispatch({type: 4});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 4});
  store.dispatch({type: '.'});
  store.dispatch({type: 5});
  store.dispatch({type: 'sigmaPlus'});
}

function expectR(store: Store, r: number, value: number) {
  const rv = store.getState().registers[r].toNumber();
  if (rv != value) {
    throw 'expected r' + r + ' to be ' + value + ', but was ' + rv;
  }
}
test('statsRegisterStates', () => {
  const store = createCalcStore();
  inputData(store);
  expectXAbout(store, 4, 'statsdata');

  expectR(store, 1, 4);
  expectR(store, 2, 9);
  expectR(store, 3, 31.5);
  expectR(store, 4, 10);
  expectR(store, 5, 30);
  expectR(store, 6, 30);

  store.dispatch({type: 4});
  store.dispatch({type: 'Enter'});
  store.dispatch({type: 4});
  store.dispatch({type: '.'});
  store.dispatch({type: 5});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'sigmaPlus'});

  expectXAbout(store, 3, '4,Enter,4.5,g,sigmaplus');
  expectR(store, 1, 3);
  expectR(store, 2, 4.5);
  expectR(store, 3, 11.25);
  expectR(store, 4, 6);
  expectR(store, 5, 14);
  expectR(store, 6, 12);
});

test('stdDev', () => {
  const store = createCalcStore();
  inputData(store);
  store.dispatch({type: 'g'});
  store.dispatch({type: '.'});
  expectXAbout(store, 1.936491673, 'statsdata, g, .');
});

test('mean', () => {
  const store = createCalcStore();
  inputData(store);
  store.dispatch({type: 'g'});
  store.dispatch({type: 0});
  expectXAbout(store, 2.25, 'statsdata,g,0');
  store.dispatch({type: 'g'});
  store.dispatch({type: 6});
  expectXAbout(store, 3.333333333, 'statsdata,g,6 -> weighted mean');
});

test('hats', () => {
  const store = createCalcStore();
  inputData(store);
  store.dispatch({type: 9});
  store.dispatch({type: 'g'});
  store.dispatch({type: 1});
  expectXAbout(store, 12, 'statsdata,9,g,1');
  store.dispatch({type: 9});
  store.dispatch({type: 'g'});
  store.dispatch({type: 2});
  expectXAbout(store, 7, 'statsdata,9,g,2');
});
