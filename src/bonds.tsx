import Decimal from 'decimal.js';
import {HUNDRED, ONE, TWO, ZERO} from './constants';
import {dateDiff, getDecimalDMY, validateDate} from './dates';

export interface BondResult {
  error: boolean;
  price: Decimal;
  accruedInterest: Decimal;
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
  console.log('N', N.toString(), 'DSM', DSM.toString());
  const yy = ONE.plus(YIELD.div(200));

  const DSC = nextCouponDays(sMonth, sDay, sYear, rMonth, rDay);
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
  //   console.log('accrued', accruedInterest.toString());
  return {error: false, price: price1.plus(price2).minus(accruedInterest), accruedInterest};
}

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
  console.log('XXX diff is ', diff.toFixed(2));
  if (diff.lessThan(-182)) {
    // console.log('RETURNING1', diff.plus(365).toFixed(2));
    return diff.plus(365);
  }
  if (diff.lessThan(ZERO)) {
    // console.log('RETURNING2', diff.plus(183).toFixed(2));
    return diff.plus(183);
  }
  if (diff.greaterThanOrEqualTo(183)) {
    // console.log('RETURNING3', diff.minus(182).toFixed(2));
    return diff.minus(182);
  }
  //   console.log('RETURNING4', diff.toFixed(2));
  return diff;
}
