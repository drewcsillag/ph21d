import Decimal from 'decimal.js';
import {HUNDRED, ZERO} from './constants';
import {computeCompoundInterest, computeI, computeN} from './interest';

test('computeNDirectly', () => {
  const res = computeN(
    new Decimal(0.05),
    new Decimal(1000),
    new Decimal(-169.257),
    new Decimal(500),
    ZERO
  );
  expect(res.toNumber()).toBeCloseTo(10, 7);
});

test('baseTest', () => {
  expect(
    computeCompoundInterest(
      new Decimal(0.05),
      new Decimal(10),
      new Decimal(1000),
      new Decimal(-169.2568624),
      new Decimal(500),
      new Decimal(0)
    ).toNumber()
  ).toBeCloseTo(0, 5);
});

test('computeITest', () => {
  const res = computeI(new Decimal(60), new Decimal(20000), new Decimal(-445.32), ZERO, ZERO).mul(
    HUNDRED
  );
  expect(res.toNumber()).toBeCloseTo(12.04263787 / 12, 2);
});
