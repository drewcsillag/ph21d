import {computeN, computeCompoundInterest, computeI} from './interest';
import Decimal from 'decimal.js';
import {ZERO, HUNDRED} from './constants';

test('computeNDirectly', () => {
  let res = computeN(
    new Decimal(0.05),
    new Decimal(1000),
    new Decimal(-169.257),
    new Decimal(500),
    ZERO
  );
  expect(res.toNumber()).toBe(10);
});

// test('baseTest', () => {
//   expect(
//     computeCompoundInterest(
//       new Decimal(0.05),
//       new Decimal(10),
//       new Decimal(1000),
//       new Decimal(-169.2568624),
//       new Decimal(500),
//       new Decimal(0)
//     ).toNumber()
//   ).toBeCloseTo(0, 5);
// });

// test('computeITest', () => {
//   let res = computeI(new Decimal(60), new Decimal(20000), new Decimal(-445.32), ZERO, ZERO).mul(
//     HUNDRED
//   );
//   expect(res.toNumber()).toBeCloseTo(12.04263787 / 12, 2);
// });
