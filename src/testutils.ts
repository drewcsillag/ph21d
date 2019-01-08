import {Decimal} from 'decimal.js';
import {State} from './interfaces';
import {Store} from 'redux';

export function expectXAbout(store: Store, expected: number, message: string) {
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  if (
    !x
      .minus(expected)
      .abs()
      .lessThan(0.0000001)
  ) {
    throw 'expected ' + message + ' to be about ' + expected + ', but was ' + x;
  }
}
