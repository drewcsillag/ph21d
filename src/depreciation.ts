import Decimal from 'decimal.js';
import {ONE, TWELVE, TWO, ZERO} from './constants';
import {add, div, frac, intg, mul, sub} from './util';

export function SL(inX: Decimal, N: Decimal, PV: Decimal, FV: Decimal): Decimal[] {
  // SL
  // let pv = //original cost
  // pet fv = //salvage value
  // let n = //useful life

  // dbfactor i
  // x is the year for things to be calculated
  // let j = state.x;
  let x = ZERO;
  let y = ZERO;

  if (inX <= N) {
    const depreciable = sub(PV, FV);
    x = div(depreciable, N);
    // x = (state.PV - state.FV) / state.N;

    y = sub(depreciable, mul(x, inX)); // sub(state.PV, sub(state.FV, mul(x, state.x)));
    // y = state.PV - state.FV - x * state.x;
  }
  // TODO what about when inX > N?
  return [x, y];
  // x = depreciation
  // y = remaining amount of depreciable
}

function SOYDk(k: Decimal) {
  const W = intg(k);
  const F = frac(k);
  const numerator = mul(add(W, ONE), add(W, mul(F, TWO)));
  return div(numerator, TWO);
}

function SOYDDepreciation(L: Decimal, j: Decimal, SBV: Decimal, SAL: Decimal) {
  const DPNjFirst = div(add(sub(L, j), ONE), SOYDk(L));
  const DPNjSecond = sub(SBV, SAL);
  const DPNj = mul(DPNjFirst, DPNjSecond);
  return DPNj;
}

export function SOYD(L: Decimal, j: Decimal, SBV: Decimal, SAL: Decimal): Decimal[] {
  const DPNj = SOYDDepreciation(L, j, SBV, SAL);

  let RDV = sub(SBV, SAL);
  for (let i = 1; i <= j.toNumber(); i++) {
    const toSub = SOYDDepreciation(L, new Decimal(i), SBV, SAL);
    RDV = sub(RDV, toSub);
  }
  return [DPNj, RDV];
}

export function DB(
  j: Decimal,
  L: Decimal,
  SBV: Decimal,
  SAL: Decimal,
  FACT: Decimal,
  Y1: Decimal
): Decimal[] {
  // TODO WHAT IS Y1 ALL ABOUT? Looks suspicious
  let i = intg(j).toNumber();
  const factOver100L = div(FACT, L);
  const Y1OverTwelve = div(Y1, TWELVE);
  const DPN1 = mul(SBV, mul(factOver100L, Y1OverTwelve));
  let RBV = sub(SBV, DPN1);
  let DPNj: Decimal = DPN1;
  while (i > 1) {
    DPNj = mul(RBV, div(FACT, L));
    RBV = sub(RBV, DPNj);
    i -= 1;
  }
  const RDV = sub(RBV, SAL);
  return [DPNj, RDV];
}
