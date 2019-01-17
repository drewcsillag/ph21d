import Decimal from 'decimal.js';
import {frac, mul, add, intg, sub, div} from './util';
import {ONE, NEG_ONE, ZERO, HUNDRED, TWO, TWELVE} from './constants';

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
  //   const fracExp = Decimal.pow(ONE.plus(i), frac(n));   /// when computing N, this yields N+1 instead of N for some reason
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

export function computeN(
  I: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal
): Decimal {
  const foundN = binSearch(
    ZERO,
    mul(new Decimal('99'), new Decimal('12')),
    new Decimal(0.00000001),
    n => {
      return computeCompoundInterest(I, n, PV, PMT, FV, begEnd);
    }
  );
  console.log(
    'residual at N-1' + computeCompoundInterest(I, foundN.sub(ONE), PV, PMT, FV, begEnd).toNumber()
  );
  const secondFound = binSearch(foundN.sub(ONE), foundN.add(ONE), new Decimal(0.00000001), n => {
    return computeCompoundInterest(I, n, PV, PMT, FV, begEnd);
  });
  return secondFound;
}

export function xcomputeN(
  I: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal
): Decimal {
  let low = ZERO;
  let high = mul(new Decimal('99'), new Decimal('12'));

  function getNewN() {
    return div(add(low, high), new Decimal(2));
  }
  const i = div(I, HUNDRED);
  let n = getNewN(); // will iterate to find this
  let res = new Decimal('30');
  const epsilon = new Decimal('0.000000001');
  let lastN = low;
  let count = 0;
  while (
    sub(lastN, n)
      .abs()
      .greaterThan(epsilon) &&
    res.abs().greaterThan(epsilon) &&
    count < 100
  ) {
    lastN = n;
    count += 1;
    res = computeCompoundInterest(i, n, PV, PMT, FV, begEnd);
    if (
      sub(lastN, n)
        .abs()
        .greaterThan(epsilon)
    ) {
      console.log('res is small enough at ' + res);
      break;
    }
    console.log('' + [low, n, high] + ' count is ' + count + ' n is ' + n + '  res is ' + res);
    if (res.lessThan(ZERO)) {
      high = n;
      n = getNewN();
      console.log('picking lower half, ' + [low, n, high]);
    } else {
      low = n;
      n = getNewN();
      console.log('picking upper half, ' + [low, n, high]);
    }
  }
  n = n.toDecimalPlaces(0);
  console.log('residual is ', res.abs().toNumber());
  return n;
}

function binSearch(high: Decimal, low: Decimal, epsilon: Decimal, func: (d: Decimal) => Decimal) {
  let mid = high.add(low).div(TWO);
  let count = 0;
  let oldMid = mid.add(epsilon.mul(HUNDRED));
  let res: Decimal = HUNDRED; //dummy value until we get going

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
  const foundI = binSearch(ZERO, HUNDRED, new Decimal(0.00000001), i => {
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
  interest: Decimal
): Decimal {
  let x = ZERO;
  let ct = 0;
  for (let i = 0; i <= N.toNumber(); i++) {
    for (let j = 0; j < cashFlowCounts[i].toNumber(); j++) {
      // konsole.log('adding ' + state.registers[i] + ' at ' + ct);

      x = add(x, div(registers[i], Decimal.pow(add(ONE, interest), new Decimal('' + ct))));
      // x = x + state.registers[i] / (1 + intrest) ** ct;
      ct += 1;
    }
  }
  return x;
}

export function computeIRR(N: Decimal, cashFlowCounts: Decimal[], registers: Decimal[]): Decimal {
  return binSearch(ZERO, new Decimal(10), new Decimal('0.000000000001'), irr => {
    return computeNPV(N, cashFlowCounts, registers, irr).negated();
  });
}
