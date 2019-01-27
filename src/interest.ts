import Decimal from 'decimal.js';
import {HUNDRED, NEG_ONE, ONE, TEN, TWELVE, TWO, ZERO} from './constants';
import {add, computeDisplayWithoutCommas, div, frac, intg, mul, sub} from './util';

export function computeCompoundInterest(
  i: Decimal,
  n: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal,
  compound: boolean,
  oddPeriod: boolean
): Decimal {
  console.log(
    'i=' + i + ', n=' + n + ', PV=' + PV + ', PMT=' + PMT + ', FV=' + FV + ', begend=' + begEnd
  );
  let fracExp;
  //setting this to one makes it work better when computing N -- weird cut point somewhere....
  if (oddPeriod) {
    if (compound) {
      fracExp = ONE.plus(i).pow(frac(n));
    } else {
      fracExp = ONE.plus(i.times(frac(n)));
    }
  } else {
    fracExp = ONE;
  }
  console.log(
    'frac exp is ' + fracExp.toNumber() + ' frac(N) is ' + frac(n) + ' n is ' + n.toNumber()
  );
  const firstHalf = mul(PV, fracExp);
  const secondHalf = mul(add(ONE, mul(begEnd, i)), PMT);
  // const secondHalf = (1 + i * begEnd) * PMT;

  const plus1 = add(ONE, i);
  const negIntgN = mul(NEG_ONE, intg(n));
  const powed = Decimal.pow(plus1, negIntgN);
  const oneMinusPowed = sub(ONE, powed);
  const bigI = div(oneMinusPowed, i);
  // const bigI = (1 - (1 + i) ** -intg(n)) / i;

  const lastPart = mul(FV, powed);
  // const lastPart = FV * (1 + i) ** -intg(n);

  return add(add(mul(secondHalf, bigI), firstHalf), lastPart);
  // return firstHalf + secondHalf * bigI + lastPart;
}

const SMALL_BINSEARCH_START = new Decimal(0.00000001);
export function computeN(
  I: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal,
  compound: boolean
): Decimal {
  const foundN = binSearch(ZERO, mul(new Decimal('99'), TWELVE), SMALL_BINSEARCH_START, n => {
    return computeCompoundInterest(I, n, PV, PMT, FV, begEnd, compound, false);
  });
  console.log(
    'residual at N-1 ' +
      computeCompoundInterest(I, foundN.sub(ONE), PV, PMT, FV, begEnd, compound, false).toNumber()
  );
  return foundN;
}

function binSearch(high: Decimal, low: Decimal, epsilon: Decimal, func: (d: Decimal) => Decimal) {
  let mid = high.add(low).div(TWO);
  let count = 0;
  let oldMid = mid.add(epsilon.mul(HUNDRED));
  let res: Decimal = HUNDRED; // dummy value until we get going

  while (
    count < 100 &&
    oldMid
      .sub(mid)
      .abs()
      .greaterThan(epsilon) &&
    res.abs().greaterThan(epsilon)
  ) {
    count += 1;
    res = func(mid);
    console.log(
      'res ' +
        res.toNumber() +
        '\n  high ' +
        high +
        '\n  low ' +
        low +
        '\n  mid ' +
        mid +
        '\n RES ' +
        (res.greaterThan(ZERO) ? ' >0 high = mid' : '<=0 low = mid')
    );

    if (res.greaterThan(ZERO)) {
      high = mid;
    } else {
      low = mid;
    }
    oldMid = mid;
    mid = high.add(low).div(TWO);
  }
  return mid;
}

export function computeI(
  N: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal,
  compound: boolean
): Decimal {
  const foundI = binSearch(ZERO, HUNDRED, SMALL_BINSEARCH_START, i => {
    return computeCompoundInterest(i, N, PV, PMT, FV, begEnd, compound, true).negated();
  });
  return foundI;
}

export function computePMT(
  I: Decimal,
  N: Decimal,
  PV: Decimal,
  FV: Decimal,
  begEnd: Decimal,
  compound: boolean
): Decimal {
  let p1;
  if (compound) {
    p1 = mul(PV, Decimal.pow(add(ONE, I), frac(N)));
  } else {
    p1 = mul(PV, add(ONE, mul(I, frac(N))));
  }
  // const p1 = state.PV * (1 + i) ** frac(state.N);
  const powed = Decimal.pow(add(ONE, I), mul(NEG_ONE, intg(N)));
  const f1 = mul(FV, powed);
  // const f1 = state.FV * (1 + i) ** -intg(state.N);
  const bigI = div(sub(ONE, powed), I);
  // const bigI =     (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = add(ONE, mul(I, begEnd));
  // const b1 = 1 + i * state.begEnd;

  return mul(div(add(p1, f1), mul(b1, bigI)), NEG_ONE);
  // return -((p1 + f1) / (b1 * bigI));
}

export function computePV(
  N: Decimal,
  I: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal,
  compound: boolean
): Decimal {
  const powed = Decimal.pow(add(ONE, I), mul(NEG_ONE, intg(N)));
  const f1 = mul(FV, powed);

  // const f1 = state.FV * (1 + i) ** -intg(state.N);
  const bigI = div(sub(ONE, powed), I);
  // const bigI =        (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = add(ONE, mul(I, begEnd));
  // const b1 = 1 + i * state.begEnd;

  const firstHalf = add(f1, mul(mul(b1, PMT), bigI));
  // const firstHalf = f1 + b1 * state.PMT * bigI
  let secondHalf;
  if (compound) {
    secondHalf = Decimal.pow(add(ONE, I), frac(N));
  } else {
    secondHalf = ONE.plus(I.mul(frac(N)));
  }
  // const secondHalf = (1 + i) ** frac(state.N);
  return mul(NEG_ONE, div(firstHalf, secondHalf));
  // return -(firstHalf / secondHalf);
}

export function computeFV(
  N: Decimal,
  I: Decimal,
  PV: Decimal,
  PMT: Decimal,
  begEnd: Decimal,
  compound: boolean
): Decimal {
  let p1;
  if (compound) {
    p1 = mul(PV, Decimal.pow(add(ONE, I), frac(N)));
  } else {
    p1 = mul(PV, add(ONE, mul(I, frac(N))));
  }
  // const p1 = state.PV * (1 + i) ** frac(state.N);

  const powed = Decimal.pow(add(ONE, I), mul(NEG_ONE, intg(N)));
  const bigI = div(sub(ONE, powed), I);
  // const bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = add(mul(I, begEnd), ONE);
  // const b1 = 1 + i * state.begEnd;

  return mul(NEG_ONE, div(add(p1, mul(mul(b1, PMT), bigI)), powed));
  // return -((p1 + b1 * state.PMT * bigI) / (1 + i) ** -intg(state.N));
}

export function computeNPV(
  N: Decimal,
  cashFlowCounts: Decimal[],
  registers: Decimal[],
  I: Decimal
): Decimal {
  let x = ZERO;
  let ct = 0;
  for (let i = 0; i <= N.toNumber(); i++) {
    for (let j = 0; j < cashFlowCounts[i].toNumber(); j++) {
      // konsole.log('adding ' + state.registers[i] + ' at ' + ct);

      x = add(x, div(registers[i], Decimal.pow(add(ONE, I), new Decimal('' + ct))));
      // x = x + state.registers[i] / (1 + intrest) ** ct;
      ct += 1;
    }
  }
  return x;
}

const SMALL_EPSILON = new Decimal('0.000000000001');
export function computeIRR(N: Decimal, cashFlowCounts: Decimal[], registers: Decimal[]): Decimal {
  return binSearch(ZERO, TEN, SMALL_EPSILON, irr => {
    return computeNPV(N, cashFlowCounts, registers, irr).negated();
  });
}

export function amort(
  x: Decimal,
  I: Decimal,
  N: Decimal,
  PV: Decimal,
  PMT: Decimal,
  fPrecision: number
): Decimal[] {
  let totalI: Decimal = ZERO;
  let totalP: Decimal = ZERO;

  for (let i = 0; i < x.toNumber(); i++) {
    const rawI = I.div(100).mul(PV);
    const thisI = new Decimal(computeDisplayWithoutCommas(rawI, fPrecision));
    const thisP = PMT.add(thisI);
    totalI = totalI.add(thisI);
    totalP = totalP.add(thisP);
    PV = PV.add(thisP);
    N = N.add(ONE);
  }

  return [totalI.mul(PMT.s), totalP, PV, N];
}

export function interest(N: Decimal, PV: Decimal, I: Decimal): Decimal[] {
  I = I.div(HUNDRED);
  const x = N.div(360)
    .mul(PV)
    .mul(I);
  const y = N.div(365)
    .mul(PV)
    .mul(I);
  return [x.negated(), PV.negated(), y.negated()];
}

// let x = ZERO;
//   let ct = 0;
//   for (let i = 0; i <= N.toNumber(); i++) {
//     for (let j = 0; j < cashFlowCounts[i].toNumber(); j++) {
//       // konsole.log('adding ' + state.registers[i] + ' at ' + ct);

//       x = add(x, div(registers[i], Decimal.pow(add(ONE, I), new Decimal('' + ct))));
//       // x = x + state.registers[i] / (1 + intrest) ** ct;
//       ct += 1;
//     }
//   }
//   return x;

function IRRFOfI(I: Decimal, N: Decimal, cashFlowCounts: Decimal[], registers: Decimal[]): Decimal {
  let accum = ZERO;
  const iPlusOne = ONE.plus(I);
  let curI = ONE;
  for (let i = 0; i <= N.toNumber(); i++) {
    for (let j = 0; j < cashFlowCounts[i].toNumber(); j++) {
      accum = accum.plus(registers[i].div(curI));
      curI = curI.times(iPlusOne);
    }
  }
  return accum;
}

function IRRPrimeOfI(
  I: Decimal,
  N: Decimal,
  cashFlowCounts: Decimal[],
  registers: Decimal[]
): Decimal {}
const binomials: number[][] = [
  [1],
  [1, 1],
  [1, 2, 1],
  [1, 3, 3, 1],
  [1, 4, 6, 4, 1],
  [1, 5, 10, 10, 5, 1],
  [1, 6, 15, 20, 15, 6, 1],
  [1, 7, 21, 35, 35, 21, 7, 1],
  [1, 8, 28, 56, 70, 56, 28, 8, 1],
  [1, 9, 36, 84, 126, 126, 84, 36, 9, 1],
  [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1],
  [1, 11, 55, 165, 330, 461, 461, 329, 164, 54, 10, 0],
  [1, 12, 66, 220, 495, 792, 924, 792, 495, 220, 66, 12, 1],
  [1, 13, 78, 286, 715, 1287, 1716, 1716, 1287, 715, 286, 78, 13, 1],
  [1, 14, 91, 364, 1001, 2002, 3003, 3432, 3003, 2002, 1001, 364, 91, 14, 1],
  [1, 15, 105, 454, 1364, 3002, 5004, 6434, 6434, 5004, 3002, 1364, 454, 104, 14, 0],
  [1, 16, 120, 560, 1820, 4368, 8008, 11440, 12870, 11440, 8007, 4367, 1819, 560, 120, 16, 1],
  [
    1,
    17,
    136,
    680,
    2380,
    6188,
    12376,
    19448,
    24310,
    24310,
    19448,
    12376,
    6188,
    2380,
    680,
    136,
    17,
    1,
  ],
  [
    1,
    18,
    153,
    816,
    3060,
    8568,
    18564,
    31824,
    43758,
    48620,
    43758,
    31824,
    18564,
    8568,
    3060,
    816,
    153,
    18,
    1,
  ],
  [
    1,
    19,
    171,
    969,
    3876,
    11628,
    27132,
    50388,
    75582,
    92378,
    92378,
    75582,
    50388,
    27132,
    11628,
    3876,
    969,
    171,
    19,
    1,
  ],
];
