import Decimal from 'decimal.js';
import {commaify, computeDisplay, computeEEXDisplay, nbspify} from './util';

test('computeDisplay', () => {
  const x = new Decimal('20.976176963');
  expect(computeDisplay(x, 9)).toBe(' 2 0.9 7 6 1 7 6 9 6');
  expect(computeDisplay(x, 8)).toBe(' 2 0.9 7 6 1 7 6 9 6');
  expect(computeDisplay(x, 7)).toBe(' 2 0.9 7 6 1 7 7 0');
  expect(computeDisplay(x, 2)).toBe(' 2 0.9 8');
  const y = new Decimal('1.4142135623730951');
  expect(computeDisplay(y, 9)).toBe(' 1.4 1 4 2 1 3 5 6 2');
  expect(computeDisplay(y, 8)).toBe(' 1.4 1 4 2 1 3 5 6');
  expect(computeDisplay(y, 7)).toBe(' 1.4 1 4 2 1 3 6');
  expect(computeDisplay(y, 2)).toBe(' 1.4 1');
  const z = new Decimal('-1.4142135623730951');
  expect(computeDisplay(z, 9)).toBe('-1.4 1 4 2 1 3 5 6 2');
  expect(computeDisplay(z, 8)).toBe('-1.4 1 4 2 1 3 5 6');
  expect(computeDisplay(z, 7)).toBe('-1.4 1 4 2 1 3 6');
  expect(computeDisplay(z, 2)).toBe('-1.4 1');
  const zz = new Decimal('23.558437978779494');
  expect(computeDisplay(zz, 9)).toBe(' 2 3.5 5 8 4 3 7 9 8');
});

test('nbspfiy', () => {
  expect(nbspify('foo bar baz')).toBe('foo&nbsp;bar&nbsp;baz');
});

test('computeEEXDisplay', () => {
  const x = new Decimal('23.55843798');
  expect(computeEEXDisplay(x)).toBe(' 2.3 5 5 8 4 3   0 1');
  const y = new Decimal('-.000555');
  expect(computeEEXDisplay(y)).toBe('-5.5 5 0 0 0 0 - 0 4');
});

test('computeDisplayWithCommas', () => {
  expect(computeDisplay(new Decimal(5), 2)).toBe(' 5.0 0');
  expect(computeDisplay(new Decimal(-5), 2)).toBe('-5.0 0');
  expect(computeDisplay(new Decimal(55), 2)).toBe(' 5 5.0 0');
  expect(computeDisplay(new Decimal(555), 2)).toBe(' 5 5 5.0 0');
  expect(computeDisplay(new Decimal(5555), 2)).toBe(' 5,5 5 5.0 0');
  expect(computeDisplay(new Decimal(55555), 2)).toBe(' 5 5,5 5 5.0 0');
  expect(computeDisplay(new Decimal(555555), 2)).toBe(' 5 5 5,5 5 5.0 0');
  expect(computeDisplay(new Decimal(5555555), 2)).toBe(' 5,5 5 5,5 5 5.0 0');
  expect(computeDisplay(new Decimal(55555555), 2)).toBe(' 5 5,5 5 5,5 5 5.0 0');
  expect(computeDisplay(new Decimal(555555555), 2)).toBe(' 5 5 5,5 5 5,5 5 5.0');
  expect(computeDisplay(new Decimal(5555555555), 2)).toBe(' 5,5 5 5,5 5 5,5 5 5.');
  expect(computeDisplay(new Decimal(55555555555), 2)).toBe(' 5.5 5 5 5 5 5   1 0');
});

test('commaify', () => {
  expect(commaify('123.00')).toBe('123.00');
  expect(commaify('1234.00')).toBe('1,234.00');
  expect(commaify('12345.00')).toBe('12,345.00');
  expect(commaify('123456.00')).toBe('123,456.00');
  expect(commaify('1234567.00')).toBe('1,234,567.00');
  expect(commaify('123')).toBe('123');
  expect(commaify('1234')).toBe('1,234');
  expect(commaify('12345')).toBe('12,345');
  expect(commaify('123456')).toBe('123,456');
  expect(commaify('1234567')).toBe('1,234,567');
});
