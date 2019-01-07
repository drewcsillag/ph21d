import Decimal from 'decimal.js';
import {ZERO, ONE, NEG_ONE} from './constants';

const mul = Decimal.mul;
const sub = Decimal.sub;

export function frac(n: Decimal): Decimal {
  let wasneg = ONE;
  if (n.lessThan(ZERO)) {
    wasneg = NEG_ONE;
  }

  const nTimesWasneg = mul(n, wasneg);
  return mul(wasneg, sub(nTimesWasneg, nTimesWasneg.floor()));
}
export function intg(n: Decimal): Decimal {
  let wasneg = ONE;
  if (n.lessThan(ZERO)) {
    wasneg = NEG_ONE;
  }
  return mul(wasneg, mul(n, wasneg).floor());
}

export enum ResultState {
  NONE = 'NONE',
  REGULAR = 'REGULAR',
  STATISTICS = 'STATISTICS',
  ENTER = 'ENTER',
}
