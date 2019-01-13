import Decimal from 'decimal.js';
import {ZERO, ONE, NEG_ONE, MAX_VALUE, MIN_VALUE} from './constants';

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

export function computeEEXDisplay(x: Decimal) {
  const s: string = x.toExponential();
  // console.log('to exponential:' + s);
  const [preExp, expSt] = s.split('e');
  // console.log('pre {' + preExp + '} expst ' + expSt);
  let e = expSt.substr(1);
  while (e.length < 2) {
    e = '0' + e;
  }
  let limit = 8;
  if (x.s == -1) {
    limit = 9;
  }
  // console.log('padded e ' + e);
  return (
    computeDisplay(new Decimal(preExp), 9, 9).substr(0, limit) +
    (expSt.charAt(0) === '+' ? ' ' : '-') +
    e
  );
}

export function computeDisplayWithoutCommas(
  x: Decimal,
  fPrecision: number,
  maxPrec: number = 10
): string {
  const sign = x.s;
  let nums = x.abs().toFixed(fPrecision);
  let limit = maxPrec;
  if (nums.indexOf('.') != -1) {
    limit = maxPrec + 1;
  }
  if (nums.length <= limit) {
    return (sign === -1 ? '-' : '') + nums;
  }
  while (nums.length > limit) {
    fPrecision -= 1;
    nums = x.abs().toFixed(fPrecision);
  }
  return (sign === -1 ? '-' : '') + nums;
}

export function computeDisplay(x: Decimal, fPrecision: number, maxPrec: number = 10): string {
  if (x.greaterThanOrEqualTo(new Decimal('10000000000'))) {
    return computeEEXDisplay(x);
  }

  const before = computeDisplayWithoutCommas(x, fPrecision, maxPrec);
  let dec = before.indexOf('.');
  if (dec == -1) {
    dec = before.length;
  }
  let s = '';
  let firstNum = false;
  for (let i = 0; i < before.length; i++) {
    if (before[i] == '-') {
      s = s + before[i];
      continue;
    }
    if (!firstNum && (before[i] >= '0' && before[i] <= '9')) {
      s = s + before[i];
      firstNum = true;
      continue;
    }
    const pointDiff = dec - i;
    if (pointDiff > 0 && pointDiff % 3 == 0) {
      s = s + ',';
    }
    s = s + before[i];
  }
  return s;
}

const ZERO_EPSILON = 0.000000001;
export function isZero(x: Decimal) {
  return x.abs().lessThan(ZERO_EPSILON);
}

export function notInValueRange(x: Decimal) {
  return !(x.lessThanOrEqualTo(MAX_VALUE) && x.greaterThanOrEqualTo(MIN_VALUE));
}
