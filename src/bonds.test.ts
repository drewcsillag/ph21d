import Decimal from 'decimal.js';
import {bondPrice} from './bonds';

test('bond', () => {
  const p = bondPrice(
    new Decimal(6.042018),
    new Decimal(4.282004),
    new Decimal(4.75),

    new Decimal(6.75),

    true
  );
  expect(p.price.toFixed(2)).toBe('120.38');
  expect(p.accruedInterest.toFixed(2)).toBe('2.69');
});

test('bondn=0', () => {
  const p = bondPrice(
    new Decimal(6.042018),
    new Decimal(4.282018),
    new Decimal(4.75),

    new Decimal(6.75),

    true
  );
  expect(p.price.toFixed(2)).toBe('100.19');
  expect(p.accruedInterest.toFixed(2)).toBe('2.69');
});

test('bond_after_mat_day_in_year', () => {
  const p = bondPrice(
    new Decimal(6.042018),
    new Decimal(10.282004),
    new Decimal(4.75),

    new Decimal(6.75),

    true
  );
  expect(p.price.toFixed(2)).toBe('119.86');
  expect(p.accruedInterest.toFixed(2)).toBe('2.69');
});

test('bond_before_mat_day_in_year', () => {
  const p = bondPrice(
    new Decimal(6.042018),
    new Decimal(1.282004),
    new Decimal(4.75),

    new Decimal(6.75),

    true
  );
  expect(p.price.toFixed(2)).toBe('120.63');
  expect(p.accruedInterest.toFixed(2)).toBe('1.01');
});

test('bond_gt_6mo_ahead', () => {
  const p = bondPrice(
    new Decimal(8.042018),
    new Decimal(1.282004),
    new Decimal(4.75),

    new Decimal(6.75),

    true
  );
  expect(p.price.toFixed(2)).toBe('120.81');
  expect(p.accruedInterest.toFixed(2)).toBe('3.25');
});

test('bond_gt_6mo_behind', () => {
  const p = bondPrice(
    new Decimal(1.042018),
    new Decimal(8.282004),
    new Decimal(4.75),

    new Decimal(6.75),

    true
  );
  expect(p.price.toFixed(2)).toBe('119.60');
  expect(p.accruedInterest.toFixed(2)).toBe('1.01');
});
