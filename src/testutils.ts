import {Decimal} from 'decimal.js';
import {Store} from 'redux';
import {State} from './interfaces';

export function expectXAbout(store: Store, expected: number, message: string) {
  const state: State = store.getState() as State;
  const x: Decimal = state.x;
  expect(
    x
      .minus(expected)
      .abs()
      .toNumber()
  ).toBeLessThan(0.0000001);
  //    {
  //     throw 'expected ' + message + ' to be about ' + expected + ', but was ' + x;
  //   }
}
