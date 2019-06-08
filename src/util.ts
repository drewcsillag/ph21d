import Decimal from 'decimal.js';
import {Store} from 'redux';
import {isUndefined} from 'util';
import {MAX_VALUE, MIN_VALUE, NEG_ONE, ONE, ZERO} from './constants';
import {ActionType, ProgramWord} from './interfaces';

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
  if (e.length === 1) {
    e = '0 ' + e;
  } else {
    e = e.charAt(0) + ' ' + e.charAt(1);
  }

  // console.log('padded e ' + e);
  return (
    computeDisplay(new Decimal(preExp), 9, 9).substr(0, 14) +
    ' ' +
    (expSt.charAt(0) === '+' ? ' ' : '-') +
    ' ' +
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
  if (nums.indexOf('.') !== -1) {
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

export function commaify(s: string): string {
  let dotindex = s.indexOf('.');
  if (dotindex < 0) {
    dotindex = s.length;
  }
  let ns = '';
  for (let i = 0; i < s.length; i++) {
    if (ns !== '' && dotindex - i > 0 && (dotindex - i) % 3 === 0) {
      ns += ',';
    }
    ns += s[i];
  }

  return ns;
}

export function nbspify(s: string): string {
  let os: string;
  do {
    os = s;
    s = s.replace(' ', '&nbsp;');
    // console.log('NBSP: os is ' + os + ' s is ' + s);
  } while (os !== s);
  return s;
}

const SMALL_VALUE = 0.000000001;
const DISPMIN_VALUE = new Decimal('1e-99');
const BIG_VALUE = new Decimal('10000000000');
export function computeDisplay(x: Decimal, fPrecision: number, maxPrec: number = 10): string {
  if (
    !x.lessThan(DISPMIN_VALUE) &&
    (x.greaterThanOrEqualTo(BIG_VALUE) || x.abs().lessThan(SMALL_VALUE))
  ) {
    return computeEEXDisplay(x);
  }

  const before = computeDisplayWithoutCommas(x, fPrecision, maxPrec);
  return postprocessDisplay(before);
}

export function postprocessDisplay(before: string) {
  let dec = before.indexOf('.');
  if (dec === -1) {
    dec = before.length;
  }
  let s = '';
  let firstNum = true;
  for (let i = 0; i < before.length; i++) {
    if (before[i] === '-') {
      s = s + before[i];
      continue;
    }
    if (i === 0 && before[i] !== '-') {
      s += ' ';
    }
    if (firstNum && (before[i] >= '0' && before[i] <= '9')) {
      s = s + before[i];
      firstNum = false;
      continue;
    }
    const pointDiff = dec - i;
    if (pointDiff > 0 && pointDiff % 3 === 0) {
      s = s + ',';
    } else if (i !== dec && i !== dec + 1) {
      s += ' ';
    }
    s = s + before[i];
  }
  if (dec === before.length) {
    s = s + '.';
  }
  return s;
}

const ZERO_EPSILON = new Decimal('1e-99');

export function isZero(x: Decimal) {
  return x.abs().lessThan(ZERO_EPSILON);
}

export function notInValueRange(x: Decimal) {
  console.log(
    'less than MAX_VALUE ' + x.abs().lessThanOrEqualTo(MAX_VALUE) + ' MAX VALUE is ' + MAX_VALUE
  );
  console.log(
    'more than MIN_VALUE ' + x.abs().greaterThanOrEqualTo(MIN_VALUE) + ' Min vALue is ' + MIN_VALUE
  );
  return !(x.lessThanOrEqualTo(MAX_VALUE) && x.greaterThanOrEqualTo(MIN_VALUE));
}

export function dispatch(store: Store, ...actions: ActionType[]) {
  actions.forEach(action => store.dispatch({type: action}));
}

export function displayCodeLine(pc: number, word: ProgramWord) {
  if (pc === 0) {
    return '000,';
  }
  const lineNo = zeroPad(pc, 3);
  const line = word;
  // console.log('WTF:line is ' + line);
  if (isUndefined(line)) {
    return 'undef:' + pc;
  }
  if (line.arg2 === null && line.arg3 === null) {
    return lineNo + ',     ' + spacePad(line.arg1, 2);
  } else if (line.arg2 !== null && line.arg3 === null) {
    let seconds = line.arg1 + ' ' + line.arg2;
    while (seconds.length < 5) {
      seconds = ' ' + seconds;
    }
    return lineNo + ',  ' + seconds;
  } else {
    if (line.arg1 === 43 && line.arg2 === 33) {
      return lineNo + ',43,33,' + zeroPad(line.arg3, 3);
    }
    return (
      lineNo + ',' + zeroPad(line.arg1, 2) + ' ' + zeroPad(line.arg2, 2) + spacePad(line.arg3, 2)
    );
  }
}

export function zeroPad(n: number, padTo: number): string {
  let s = '' + n;
  while (s.length < padTo) {
    s = '0' + s;
  }
  return s;
}

export function spacePad(n: number, padTo: number): string {
  let s = '' + n;
  while (s.length < padTo) {
    s = ' ' + s;
  }
  return s;
}
