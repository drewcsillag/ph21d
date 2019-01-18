import * as immutable from 'immutable';
import {initialState} from './constants';
import {State} from './interfaces';

test('immutableMap', () => {
  let state = immutable.Map<string, any>();
  for (const k in Object.keys(state)) {
    state = state.set(k, (initialState as any)[k]);
  }
  const start = new Date();
  let t = 0;
  for (let i = 0; i < 10000; i++) {
    state = state.set('programCounter', i);
    t += state.get('programCounter') as number;
  }
  const end = new Date();
  console.log(
    'immutableMap:' + (end.getUTCMilliseconds() - start.getUTCMilliseconds()) + '  t = ' + t
  );
});

test('immutableRecord', () => {
  const stateType = immutable.Record(initialState);
  let state = stateType();
  const start = new Date();
  let t = 0;
  for (let i = 0; i < 10000; i++) {
    state = state.set('programCounter', i);
    t += state.programCounter;
  }
  const end = new Date();
  console.log(
    'immutableRecord:' + (end.getUTCMilliseconds() - start.getUTCMilliseconds()) + '  t = ' + t
  );
  console.log('PEC is ' + state.programEditCounter);
});

test('spreadop', () => {
  let state: State = initialState;
  const start = new Date();
  let t = 0;
  for (let i = 0; i < 100000; i++) {
    state = {...state, programCounter: i};
    t += state.programCounter;
  }
  const end = new Date();
  console.log('spreadop:' + (end.getUTCMilliseconds() - start.getUTCMilliseconds()) + '  t = ' + t);
});
