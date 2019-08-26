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
  const x: string = p.price.toFixed(2);
  expect(x).toBe('120.38');
});
