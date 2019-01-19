import Decimal from 'decimal.js';
import {HUNDRED, NEG_ONE, ONE, TEN, TWELVE, TWO, ZERO} from './constants';
import {add, computeDisplayWithoutCommas, div, frac, intg, mul, sub} from './util';

export function computeCompoundInterest(
  i: Decimal,
  n: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal
): Decimal {
  console.log(
    'i=' + i + ', n=' + n + ', PV=' + PV + ', PMT=' + PMT + ', FV=' + FV + ', begend=' + begEnd
  );
  // const firstHalf = PV * (1 + i) ** frac(n);
  const fracExp = ONE; // (1 + i) ** frac(n);
  // const fracExp = Decimal.pow(ONE.plus(i), frac(n)); // when computing N, yields N+1 instead of N for some reason
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
  begEnd: Decimal
): Decimal {
  const foundN = binSearch(ZERO, mul(new Decimal('99'), TWELVE), SMALL_BINSEARCH_START, n => {
    return computeCompoundInterest(I, n, PV, PMT, FV, begEnd);
  });
  console.log(
    'residual at N-1' + computeCompoundInterest(I, foundN.sub(ONE), PV, PMT, FV, begEnd).toNumber()
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
  begEnd: Decimal
): Decimal {
  const foundI = binSearch(ZERO, HUNDRED, SMALL_BINSEARCH_START, i => {
    return computeCompoundInterest(i, N, PV, PMT, FV, begEnd).negated();
  });
  return foundI;
}

export function computePMT(
  I: Decimal,
  N: Decimal,
  PV: Decimal,
  FV: Decimal,
  begEnd: Decimal
): Decimal {
  const p1 = mul(PV, Decimal.pow(add(ONE, I), frac(N)));
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
  begEnd: Decimal
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
  const secondHalf = Decimal.pow(add(ONE, I), frac(N));
  // const secondHalf = (1 + i) ** frac(state.N);
  return mul(NEG_ONE, div(firstHalf, secondHalf));
  // return -(firstHalf / secondHalf);
}

export function computeFV(
  N: Decimal,
  I: Decimal,
  PV: Decimal,
  PMT: Decimal,
  begEnd: Decimal
): Decimal {
  const p1 = mul(PV, Decimal.pow(add(ONE, I), frac(N)));
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
