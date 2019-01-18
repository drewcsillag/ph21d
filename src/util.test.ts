import Decimal from 'decimal.js';
import {commaify, computeDisplay, computeEEXDisplay} from './util';

test('computeDisplay', () => {
  const x = new Decimal('20.976176963');
  expect(computeDisplay(x, 9)).toBe('20.97617696');
  expect(computeDisplay(x, 8)).toBe('20.97617696');
  expect(computeDisplay(x, 7)).toBe('20.9761770');
  expect(computeDisplay(x, 2)).toBe('20.98');
  const y = new Decimal('1.4142135623730951');
  expect(computeDisplay(y, 9)).toBe('1.414213562');
  expect(computeDisplay(y, 8)).toBe('1.41421356');
  expect(computeDisplay(y, 7)).toBe('1.4142136');
  expect(computeDisplay(y, 2)).toBe('1.41');
  const z = new Decimal('-1.4142135623730951');
  expect(computeDisplay(z, 9)).toBe('-1.414213562');
  expect(computeDisplay(z, 8)).toBe('-1.41421356');
  expect(computeDisplay(z, 7)).toBe('-1.4142136');
  expect(computeDisplay(z, 2)).toBe('-1.41');
  const zz = new Decimal('23.558437978779494');
  expect(computeDisplay(zz, 9)).toBe('23.55843798');
});

test('computeEEXDisplay', () => {
  const x = new Decimal('23.55843798');
  expect(computeEEXDisplay(x)).toBe('2.355843 01');
  const y = new Decimal('-.000555');
  expect(computeEEXDisplay(y)).toBe('-5.550000-04');
});

test('computeDisplayWithCommas', () => {
  expect(computeDisplay(new Decimal(5), 2)).toBe('5.00');
  expect(computeDisplay(new Decimal(55), 2)).toBe('55.00');
  expect(computeDisplay(new Decimal(555), 2)).toBe('555.00');
  expect(computeDisplay(new Decimal(5555), 2)).toBe('5,555.00');
  expect(computeDisplay(new Decimal(55555), 2)).toBe('55,555.00');
  expect(computeDisplay(new Decimal(555555), 2)).toBe('555,555.00');
  expect(computeDisplay(new Decimal(5555555), 2)).toBe('5,555,555.00');
  expect(computeDisplay(new Decimal(55555555), 2)).toBe('55,555,555.00');
  expect(computeDisplay(new Decimal(555555555), 2)).toBe('555,555,555.0');
  expect(computeDisplay(new Decimal(5555555555), 2)).toBe('5,555,555,555');
  expect(computeDisplay(new Decimal(55555555555), 2)).toBe('5.555555 10');
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
