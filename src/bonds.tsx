import Decimal from 'decimal.js';
import {HUNDRED, ONE, TWO, ZERO} from './constants';
import {dateDiff, getDecimalDMY, plusDays, validateDate} from './dates';
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

export interface YieldResult {
  YIELD: Decimal;
  error: boolean;
  redempAndCoup: Decimal;
  daysRatio: Decimal;
}

/// update for coupon dates --> https://quant.stackexchange.com/questions/31506/how-to-compute-dates-for-bond

// const DIY = new Decimal(365);
// const E = new Decimal(183);

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
    // console.log(
    //   'YIELD',
    //   YIELD.toFixed(2),
    //   'price',
    //   {error: price.error, price: price.price.equals(ZERO) ? 'FAIL' : price.price.toFixed(2)},
    //   res.toFixed(2)
    // );
    return res;
  });
  // console.log('DSC', daysRatio.map(x => x.toFixed(2)));

  // console.log('DSC', DSC.toFixed(2));
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
  // const E = DIY.div(TWO);
  const RDV = HUNDRED;
  // redemption
  const [rMonth, rDay, rYear] = getDecimalDMY(mDotDY, redemption);
  // settlement
  const [sMonth, sDay, sYear] = getDecimalDMY(mDotDY, settlement);

  if (validateDate(rMonth, rDay) || validateDate(sMonth, sDay)) {
    return {error: true, accruedInterest: ZERO, price: ZERO};
  }

  //   console.log(
  //     'CPN',
  //     CPN.toString(),
  //     'YIELD',
  //     YIELD.toString(),
  //     'RDATE',
  //     rMonth.toString(),
  //     rDay.toString(),
  //     'SETTLEMENT',
  //     sMonth.toString(),
  //     sDay.toString(),
  //     sYear.toString()
  //   );
  const DSM = dateDiff(sYear, sMonth, sDay, rYear, rMonth, rDay);
  const N = DSM.div(DIY.div(2)).ceil();
  //   console.log('N', N.toString(), 'DSM', DSM.toString());
  const yy = ONE.plus(YIELD.div(200));
  const nextCoupon = nextCouponDays(sMonth, sDay, sYear, rMonth, rDay);
  const DSC = nextCoupon[0];
  // const actualE = E.plus(firstPeriodSpansLeapDay(sMonth, sDay, sYear, DSC));
  // console.log('actual E', actualE.toFixed(2));
  const E = couponPeriod(nextCoupon[1], nextCoupon[2], nextCoupon[3]);
  // console.log('E is', E.toFixed(2));
  const DCS = E.minus(DSC);
  //   console.log('DCS', DCS.toString(), 'DSC', DSC.toString());
  const price1 = RDV.div(yy.pow(N.minus(1).plus(DSC.div(E))));
  //   console.log('price1', price1.toString());
  let price2 = ZERO;
  for (let k = ONE; k.lessThanOrEqualTo(N); k = k.plus(ONE)) {
    // console.log('iprice2', k.toString(), price2.toString());

    price2 = price2.plus(CPN.div(TWO).div(yy.pow(k.minus(ONE).plus(DSC.div(E)))));
  }
  //   console.log('price2', price2.toString());
  const accruedInterest = CPN.div(TWO).mul(DCS.div(E));
  // const accruedInterest1 = CPN.div(TWO).mul(DCS.div(E));
  //   console.log('accrued', accruedInterest.toString());
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
  const prevCpnSameYear = adjustedCpnDate(sYear, otherMonth, sDay);
  const prevDiffSY = dateDiff(
    prevCpnSameYear[0],
    prevCpnSameYear[1],
    prevCpnSameYear[2],
    sYear,
    sMonth,
    sDay
  );
  // console.log(
  //   'PCSY',
  //   [prevCpnSameYear[0], prevCpnSameYear[1], prevCpnSameYear[2], sYear, sMonth, sDay].map(x =>
  //     x.toFixed(2)
  //   )
  // );
  const prevCpnLastYear = adjustedCpnDate(sYear.minus(ONE), otherMonth, sDay);
  const prevDiffLY = dateDiff(
    prevCpnLastYear[0],
    prevCpnLastYear[1],
    prevCpnLastYear[2],
    sYear,
    sMonth,
    sDay
  );
  // console.log(
  //   'PCLY',
  //   [prevCpnLastYear[0], prevCpnLastYear[1], prevCpnLastYear[2], sYear, sMonth, sDay].map(x =>
  //     x.toFixed(2)
  //   )
  // );
  // console.log('prevdiffLY', prevDiffLY.toFixed(2), 'prevDiffSY', prevDiffSY.toFixed(2));
  const l = [prevDiffLY, prevDiffSY].filter(x => x.greaterThan(ZERO));
  // a and b will never be ==, so comparator can be dumn
  l.sort((a, b) => {
    return a.lessThan(b) ? -1 : 1;
  });
  return l[0];
  // only one of these should be > 0
  // return prevDiffLY.greaterThan(ZERO) ? prevDiffLY : prevDiffSY;
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
  // console.log(
  //   '1) diff from to',
  //   [sYear, sMonth, sDay, cpnDate[0], cpnDate[1], cpnDate[2]].map(x => x.toFixed(2)),
  //   matDiff.toFixed(2)
  // );

  const mat6Diff = dateDiff(sYear, sMonth, sDay, otherCpnDate[0], otherCpnDate[1], otherCpnDate[2]);
  // console.log(
  //   '2) diff from to',
  //   [sYear, sMonth, sDay, otherCpnDate[0], otherCpnDate[1], otherCpnDate[2]].map(x => x.toFixed(2)),
  //   mat6Diff.toFixed(2)
  // );
  const nextCpnDate = matDiff.lessThan(mat6Diff) ? cpnDate : otherCpnDate;
  const res = matDiff.lessThan(mat6Diff) ? matDiff : mat6Diff;
  // console.log('num cpn days', res.toFixed(2));
  return [res, nextCpnDate[0], nextCpnDate[1], nextCpnDate[2]];
}

// returns ymd
function cpnDateInFuture(
  thisYear: Decimal,
  cpnMonth: Decimal,
  cpnDay: Decimal,
  thisMonth: Decimal,
  thisDay: Decimal
) {
  const a = adjustedCpnDate(thisYear, cpnMonth, cpnDay);
  const diff = dateDiff(thisYear, thisMonth, thisDay, thisYear, a[1], a[2]);
  if (diff.greaterThanOrEqualTo(ZERO)) {
    // console.log(
    //   'cpn date from ',
    //   [thisYear, cpnMonth, cpnDay, thisMonth, thisDay].map(x => x.toFixed(2)),
    //   a.map(x => x.toFixed(2))
    // );
    return a;
  }
  // console.log(
  //   'cpn date from ',
  //   [thisYear, cpnMonth, cpnDay, thisMonth, thisDay].map(x => x.toFixed(2)),
  //   adjustedCpnDate(thisYear.plus(ONE), cpnMonth, cpnDay).map(x => x.toFixed(2))
  // );
  return adjustedCpnDate(thisYear.plus(ONE), cpnMonth, cpnDay);
}

// returns Ymd of adjusted coupon date (for weekeneds)
function adjustedCpnDate(year: Decimal, month: Decimal, day: Decimal): [Decimal, Decimal, Decimal] {
  let res = plusDays(month, day, year, ZERO);
  const dow = res[3];
  if (dow === 0) {
    // Sunday, advance by a day
    res = plusDays(month, day, year, ONE);
  } else if (dow === 6) {
    // Saturday, back up one
    res = plusDays(month, day, year, ZERO);
  }
  return [new Decimal(res[0]), new Decimal(res[1]), new Decimal(res[2])];
}
