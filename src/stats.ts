import Decimal from 'decimal.js';
import {ONE} from './constants';
import {StatsRegisterBundle} from './interfaces';
import {add, div, mul, sub} from './util';

function computeABr(regs: StatsRegisterBundle) {
  const sy = regs.sumY;
  const sy2 = regs.sumY2;
  const n = regs.n;
  const sx = regs.sumX;
  const sxy = regs.sumXY;
  const sx2 = regs.sumX2;

  const Bnum = sub(sxy, div(mul(sx, sy), n));
  // const Bnum = sxy - (sx * sy) / n;
  const Bden = sub(sx2, div(mul(sx, sx), n));
  // const Bden = sx2 - (sx * sx) / n;
  const B = div(Bnum, Bden);
  // const B = Bnum / Bden;
  const A = sub(div(sy, n), mul(B, div(sx, n)));
  // const A = sy / n - B * (sx / n);

  const Rnum = sub(sxy, div(mul(sx, sy), n));
  // const Rnum = sxy - (sx * sy) / n;
  const Rden1 = sub(sx2, div(mul(sx, sx), n));
  // const Rden1 = sx2 - (sx * sx) / n;
  const Rden2 = sub(sy2, div(mul(sy, sy), n));
  // const Rden2 = sy2 - (sy * sy) / n;
  const R = div(Rnum, Decimal.pow(mul(Rden1, Rden2), 0.5));
  // const R = Rnum / (Rden1 * Rden2) ** 0.5;
  return [A, B, R];
}

export function getStdDevNumerators(regs: StatsRegisterBundle): Decimal[] {
  const sumX2 = regs.sumX2;
  const sumX = regs.sumX;
  const n = regs.n;
  const sxNumerator = sub(mul(n, sumX2), Decimal.pow(sumX, 2));
  const sumY2 = regs.sumY2;
  const sumY = regs.sumY;
  const syNumerator = sub(mul(n, sumY2), Decimal.pow(sumY, 2));

  return [sxNumerator, syNumerator];
}

export function computeXHat(regs: StatsRegisterBundle, x: Decimal): Decimal[] {
  const [A, B, R] = computeABr(regs);
  return [div(sub(x, A), B), R];
}

export function computeYHat(regs: StatsRegisterBundle, x: Decimal): Decimal[] {
  const [A, B, R] = computeABr(regs);
  return [add(A, mul(B, x)), R];
}

export function stdDev(n: Decimal, sxNumerator: Decimal, syNumerator: Decimal): Decimal[] {
  const sDenominator = mul(n, sub(n, ONE));
  const sX = Decimal.pow(div(sxNumerator, sDenominator), 0.5);
  const sY = Decimal.pow(div(syNumerator, sDenominator), 0.5);
  return [sX, sY];
}

export function addPoint(x: Decimal, y: Decimal, inRegs: StatsRegisterBundle): StatsRegisterBundle {
  return {
    n: inRegs.n.add(ONE),
    sumX: inRegs.sumX.add(x),
    sumX2: inRegs.sumX2.add(x.mul(x)),
    sumY: inRegs.sumY.add(y),
    sumY2: inRegs.sumY2.add(y.mul(y)),
    sumXY: inRegs.sumXY.add(x.mul(y)),
  };
}

export function subPoint(x: Decimal, y: Decimal, inRegs: StatsRegisterBundle): StatsRegisterBundle {
  return {
    n: inRegs.n.sub(ONE),
    sumX: inRegs.sumX.sub(x),
    sumX2: inRegs.sumX2.sub(x.mul(x)),
    sumY: inRegs.sumY.sub(y),
    sumY2: inRegs.sumY2.sub(y.mul(y)),
    sumXY: inRegs.sumXY.sub(x.mul(y)),
  };
}

export function mean(bundle: StatsRegisterBundle): Decimal[] {
  return [bundle.sumX.div(bundle.n), bundle.sumY.div(bundle.n)];
}

export function weightedMean(bundle: StatsRegisterBundle) {
  return bundle.sumXY.div(bundle.sumX);
}
