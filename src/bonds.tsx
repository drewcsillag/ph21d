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

  console.log('DSC', DSC.toFixed(2));
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
  const E = DIY.div(TWO);
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

  const DSC = nextCouponDays(sMonth, sDay, sYear, rMonth, rDay);
  // const actualE = E.plus(firstPeriodSpansLeapDay(sMonth, sDay, sYear, DSC));
  // console.log('actual E', actualE.toFixed(2));
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
  };
}

export function firstPeriodSpansLeapDay(
  sMonth: Decimal,
  sDay: Decimal,
  sYear: Decimal,
  DSC: Decimal
): Decimal {
  const [pBY, pBM, pBD] = plusDays(sMonth, sDay, sYear, DSC).slice(0, 3);
  const [pSY, pSM, pSD] = plusDays(
    new Decimal(pBM),
    new Decimal(pBD),
    new Decimal(pBY),
    new Decimal(-183)
  );
  if (!isLeapYear(pSY) && !isLeapYear(pBY)) {
    console.log('between', pSM, pSD, pSY, pBM, pBD, pBY, 'no');
    return ZERO;
  }

  if (isLeapYear(pBY) && (pBM === 1 || (pBM === 2 && pBD <= 28))) {
    console.log('between', pSM, pSD, pSY, pBM, pBD, pBY, 'no');
    return ZERO;
  }

  if (isLeapYear(pSY) && pSM > 2) {
    console.log('between', pSM, pSD, pSY, pBM, pBD, pBY, 'no');
    return ZERO;
  }
  console.log('yes', pSM, pSD, pSY, pBM, pBD, pBY, 'no');
  return ONE;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Returns the number of days until the next coupon, and the number
// of days in the coupon period. Assumes period from maturity date in
// start year to first coupon is 182 days, and the other is 183.
// DOES NOT HANDLE LEAP YEARS.
function nextCouponDays(
  sMonth: Decimal,
  sDay: Decimal,
  sYear: Decimal,
  rMonth: Decimal,
  rDay: Decimal
): Decimal {
  // CHECK FOR OBOES
  // if diff (r, s) < -182, next is r + 365
  // if diff (r, s) < 0, next is r + 183
  // if diff (r, s) > 183, next is r - 182
  // if diff (r, s) >= 0, next is r

  const diff = dateDiff(sYear, sMonth, sDay, sYear, rMonth, rDay);

  //   console.log('XXX diff is ', diff.toFixed(2));
  if (diff.lessThan(-182)) {
    // console.log('RETURNING1', diff.plus(365).toFixed(2));
    // LEAP YEAR IN TEST DATA

    return diff.plus(365);
  }
  if (diff.lessThan(ZERO)) {
    // console.log('RETURNING2', diff.plus(183).toFixed(2));
    return diff.plus(183);
  }
  if (diff.greaterThanOrEqualTo(183)) {
    // console.log('RETURNING3', diff.minus(182).toFixed(2));
    /// LEAP YEAR IN TEST DATA
    return diff.minus(182);
  }
  //   console.log('RETURNING4', diff.toFixed(183));
  return diff;
}
