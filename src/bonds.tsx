import Decimal from 'decimal.js';
import {HUNDRED, ONE, TWO, ZERO} from './constants';
import {dateDiff, getDecimalDMY, validateDate} from './dates';
import {binSearch, SMALL_EPSILON} from './interest';

export interface BondResult {
  error: boolean;
  price: Decimal;
  accruedInterest: Decimal;
  DSC?: Decimal;
  E?: Decimal;
  YIELD?: Decimal;
  redempAndCoup?: Decimal;
  daysRatio?: Decimal;
}

export function findYTM(
  redemption: Decimal,
  settlement: Decimal,
  PRICE: Decimal,
  CPN: Decimal,
  mDotDY: boolean
): BondResult {
  // redemption
  const [rMonth, rDay] = getDecimalDMY(mDotDY, redemption).slice(0, 2);
  // settlement
  const [sMonth, sDay] = getDecimalDMY(mDotDY, settlement).slice(0, 2);

  if (validateDate(rMonth, rDay) || validateDate(sMonth, sDay)) {
    return {error: true, accruedInterest: ZERO, price: ZERO, DSC: ZERO, E: ZERO, YIELD: ZERO};
  }

  let DSC: Decimal;
  let E: Decimal;

  const retYield = binSearch(new Decimal(1000), new Decimal(-1000), SMALL_EPSILON, YIELD => {
    const price = bondPrice(redemption, settlement, YIELD, CPN, mDotDY);
    const res = PRICE.minus(price.price);
    DSC = price.DSC;
    E = price.E;
    return res;
  });
  return {
    error: false,
    YIELD: retYield,
    redempAndCoup: new Decimal(100).plus(CPN.div(TWO)),
    daysRatio: DSC.div(E),
    E,
    DSC,
    price: ZERO,
    accruedInterest: ZERO,
  };
}

export function bondPrice(
  redemption: Decimal,
  settlement: Decimal,
  YIELD: Decimal,
  CPN: Decimal,
  mDotDY: boolean
): BondResult {
  const DIY = new Decimal(365.2425);
  const RDV = HUNDRED;
  // redemption
  const [rMonth, rDay, rYear] = getDecimalDMY(mDotDY, redemption);
  // settlement
  const [sMonth, sDay, sYear] = getDecimalDMY(mDotDY, settlement);

  if (validateDate(rMonth, rDay) || validateDate(sMonth, sDay)) {
    return {error: true, accruedInterest: ZERO, price: ZERO};
  }

  const DSM = dateDiff(sYear, sMonth, sDay, rYear, rMonth, rDay);
  const N = DSM.div(DIY.div(2)).ceil();
  const yy = ONE.plus(YIELD.div(200));
  const nextCoupon = nextCouponDays(sMonth, sDay, sYear, rMonth, rDay);
  const DSC = nextCoupon[0];
  const E = couponPeriod(nextCoupon[1], nextCoupon[2], nextCoupon[3]);
  const DCS = E.minus(DSC);
  const price1 = RDV.div(yy.pow(N.minus(1).plus(DSC.div(E))));
  let price2 = ZERO;
  for (let k = ONE; k.lessThanOrEqualTo(N); k = k.plus(ONE)) {
    price2 = price2.plus(CPN.div(TWO).div(yy.pow(k.minus(ONE).plus(DSC.div(E)))));
  }
  const accruedInterest = CPN.div(TWO).mul(DCS.div(E));
  return {
    error: false,
    price: price1.plus(price2).minus(accruedInterest),
    accruedInterest,
    DSC,
    E,
  };
}

function couponPeriod(sYear: Decimal, sMonth: Decimal, sDay: Decimal): Decimal {
  const otherMonth = sMonth.greaterThan(6) ? sMonth.minus(6) : sMonth.plus(6);
  const prevCpnSameYear = [sYear, otherMonth, sDay];
  const prevDiffSY = dateDiff(
    prevCpnSameYear[0],
    prevCpnSameYear[1],
    prevCpnSameYear[2],
    sYear,
    sMonth,
    sDay
  );
  const prevCpnLastYear = [sYear.minus(ONE), otherMonth, sDay];
  const prevDiffLY = dateDiff(
    prevCpnLastYear[0],
    prevCpnLastYear[1],
    prevCpnLastYear[2],
    sYear,
    sMonth,
    sDay
  );
  const l = [prevDiffLY, prevDiffSY].filter(x => x.greaterThan(ZERO));
  // a and b will never be ==, so comparator can be dum
  l.sort((a, b) => {
    return a.lessThan(b) ? -1 : 1;
  });
  return l[0];
}

// Returns the number of days until the next coupon, and the number
// of days in the coupon period.
function nextCouponDays(
  sMonth: Decimal,
  sDay: Decimal,
  sYear: Decimal,
  rMonth: Decimal,
  rDay: Decimal
): [Decimal, Decimal, Decimal, Decimal] {
  const cpnDate = cpnDateInFuture(sYear, rMonth, rDay, sMonth, sDay);
  const otherMonth = rMonth.plus(6).greaterThan(12) ? rMonth.minus(6) : rMonth.plus(6);
  const otherCpnDate = cpnDateInFuture(sYear, otherMonth, rDay, sMonth, sDay);

  const matDiff = dateDiff(sYear, sMonth, sDay, cpnDate[0], cpnDate[1], cpnDate[2]);
  const mat6Diff = dateDiff(sYear, sMonth, sDay, otherCpnDate[0], otherCpnDate[1], otherCpnDate[2]);
  const nextCpnDate = matDiff.lessThan(mat6Diff) ? cpnDate : otherCpnDate;
  const res = matDiff.lessThan(mat6Diff) ? matDiff : mat6Diff;
  return [res, nextCpnDate[0], nextCpnDate[1], nextCpnDate[2]];
}

// returns ymd
function cpnDateInFuture(
  thisYear: Decimal,
  cpnMonth: Decimal,
  cpnDay: Decimal,
  thisMonth: Decimal,
  thisDay: Decimal
): [Decimal, Decimal, Decimal] {
  const diff = dateDiff(thisYear, thisMonth, thisDay, thisYear, cpnMonth, cpnDay);
  if (diff.greaterThanOrEqualTo(ZERO)) {
    return [thisYear, cpnMonth, cpnDay];
  }
  return [thisYear.plus(ONE), cpnMonth, cpnDay];
}
