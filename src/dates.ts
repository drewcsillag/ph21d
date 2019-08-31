import Decimal from 'decimal.js';
import {HUNDRED, ONE, THIRTY, THIRTY_ONE, TWELVE, ZERO} from './constants';
import {add, div, frac, intg, mul, sub} from './util';

export function validateDate(month: Decimal, day: Decimal): boolean {
  // console.log('month ' + month + ' day ' + day);
  // validation stuff
  if (month.lessThan(ONE) || month.greaterThan(TWELVE)) {
    console.log('month out of range');
    return true;
  }
  if (day.greaterThan(THIRTY_ONE)) {
    console.log('day > 31');
    return true;
  } else if (
    (month.equals(4) || month.equals(6) || month.equals(9) || month.equals(11)) &&
    day.greaterThan(THIRTY)
  ) {
    console.log('day > 30');
    return true;
  } else if (month.equals(2) && day.greaterThan(29)) {
    console.log('day > 29');
    return true;
  } else {
    return false;
  }
}

export function getDecimalDMY(mDotDY: boolean, n: Decimal): Decimal[] {
  const month = mDotDY ? intg(n) : intg(mul(HUNDRED, frac(n)));
  const day = mDotDY ? intg(mul(frac(n), HUNDRED)) : intg(n);

  const yearRounded = add(n, new Decimal('0.0000005'));
  const year = intg(mul(new Decimal(10000), frac(mul(yearRounded, HUNDRED))));
  // const year = intg(frac(n * 100) * 10000 + 0.0000005);
  return [month, day, year];
}

export function YMDToDec(yyyy: Decimal, mm: Decimal, dd: Decimal) {
  // have to check on leap days around centuries/400's
  let x;
  let z;
  if (mm.lessThanOrEqualTo(2)) {
    x = ZERO;
    z = sub(yyyy, ONE);
  } else {
    x = intg(add(mul(new Decimal(0.4), mm), new Decimal(2.3)));
    z = yyyy;
  }

  return sub(
    add(
      add(add(mul(new Decimal(365), yyyy), mul(THIRTY_ONE, sub(mm, ONE))), dd),
      intg(div(z, new Decimal(4)))
    ),
    x
  );
}

function dt(yyyy: Decimal, mm: Decimal, z: Decimal) {
  return yyyy
    .mul(360)
    .add(mm.sub(1).mul(30))
    .add(z);
}

export function dateDiff360(
  yyyy1: Decimal,
  mm1: Decimal,
  dd1: Decimal,
  yyyy2: Decimal,
  mm2: Decimal,
  dd2: Decimal
) {
  let z1: Decimal;
  if (dd1.equals(THIRTY_ONE)) {
    z1 = THIRTY;
  } else {
    z1 = dd1;
  }
  const fDT1 = dt(yyyy1, mm1, z1);

  let z2: Decimal;
  if (dd2.equals(THIRTY_ONE) && (dd1.equals(THIRTY) || dd1.equals(THIRTY_ONE))) {
    z2 = THIRTY;
  } else if (dd2.equals(THIRTY_ONE) && dd1.lessThan(THIRTY)) {
    z2 = dd2;
  } else {
    z2 = dd2;
  }

  const fDT2 = dt(yyyy2, mm2, z2);
  return fDT2.sub(fDT1);
}

export function plusDays(
  month: Decimal,
  day: Decimal,
  year: Decimal,
  n: Decimal
): [number, number, number, number] {
  // console.log('YDATE= month ' + month + ' day ' + day + ' year ' + year);

  const d = new Date();
  d.setUTCMonth(month.toNumber() - 1);
  d.setUTCDate(day.toNumber());
  d.setUTCFullYear(year.toNumber());
  // console.log('-->' + d);
  d.setTime(d.getTime() + 86400000 * n.toNumber());
  // console.log('--after adding ' + n + ' days ' + d);
  // console.log('date -> ' + (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + '/' + d.getUTCFullYear());
  const dow = d.getDay() === 0 ? 7 : d.getDay();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), dow];
}

export function dateDiff(
  stYear: Decimal,
  stMonth: Decimal,
  stDay: Decimal,
  enYear: Decimal,
  enMonth: Decimal,
  enDay: Decimal
): Decimal {
  const stDate = new Date();
  stDate.setUTCFullYear(stYear.toNumber());
  stDate.setUTCMonth(stMonth.sub(ONE).toNumber());
  stDate.setUTCDate(stDay.toNumber());

  const enDate = new Date();
  enDate.setUTCFullYear(enYear.toNumber());
  enDate.setUTCMonth(enMonth.sub(ONE).toNumber());
  enDate.setUTCDate(enDay.toNumber());

  const diff = (enDate.getTime() - stDate.getTime()) / 86400000;
  // const end = YMDToDec(enYear, enMonth, enDay);
  // console.log('end YMD NUMBER ->' + end.toNumber());
  return intg(new Decimal(diff).toDecimalPlaces(0));
}
