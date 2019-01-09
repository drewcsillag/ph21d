import {createCalcStore} from './redux_actions';
import {Store} from 'redux';
import {expectXAbout} from './testutils';

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

export function computeFVTest() {
  const store = createCalcStore();
  tenN(store);
  fiveI(store);
  thousandPV(store);
  approxPMT(store);
  store.dispatch({type: 'FV'});
  expectXAbout(store, 500.0017301, '0,N,5,I,1000,PV,-169.257,PMT,FV');
}

export function computePVTest() {
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
}

export function computeITest() {
  const store = createCalcStore();
  tenN(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'I'});
  expectXAbout(store, 5, '10,N,500,FV,1000,PV,-169.257,PMT,I');
}

export function computeNTest() {
  const store = createCalcStore();
  fiveI(store);
  thousandPV(store);
  fiveHundredFV(store);
  approxPMT(store);
  store.dispatch({type: 'N'});
  expectXAbout(store, 10, '5,I,500,FV,1000,PV,-169.257,PMT,N');
}
