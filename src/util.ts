import Decimal from 'decimal.js';
import {ZERO, ONE, NEG_ONE} from './constants';

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

export function add(x: Decimal, y: Decimal): Decimal {
  return x.add(y);
}
export function mul(x: Decimal, y: Decimal) {
  return x.mul(y);
}
export function sub(x: Decimal, y: Decimal): Decimal {
  return x.sub(y);
}
export function div(x: Decimal, y: Decimal): Decimal {
  return x.div(y);
}
