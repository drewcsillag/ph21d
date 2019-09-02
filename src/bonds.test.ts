import Decimal from 'decimal.js';
import {bondPrice, findYTM} from './bonds';
import {createCalcStore} from './redux_actions';
import {dispatch} from './util';

test('bond1', () => {
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
  expect(p.accruedInterest.toFixed(2)).toBe('2.69');
  expect(p.price.toFixed(2)).toBe('119.86');
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

test('bond_cpn_on_sunday', () => {
  const p = bondPrice(
    new Decimal(6.062018),
    new Decimal(2.042004),
    new Decimal(4.75),
    new Decimal(6.75),
    true
  );
  expect(p.price.toFixed(5)).toBe('120.61552');
  expect(p.accruedInterest.toFixed(5)).toBe('1.10656');
});

test('basic yield', () => {
  const y = findYTM(
    new Decimal(6.042018),
    new Decimal(4.282004),
    new Decimal(122.13),
    new Decimal(6.75),
    true
  );
  expect(y.YIELD.toFixed(2)).toBe('4.60');
  expect(y.daysRatio.toFixed(5)).toBe('0.20219');
  expect(y.redempAndCoup.toFixed(5)).toBe('103.37500');
});

test('yield_after_mat_day_in_year', () => {
  const y = findYTM(
    new Decimal(6.042018),
    new Decimal(10.282004),
    new Decimal(119.86),

    new Decimal(6.75),

    true
  );
  expect(y.YIELD.toFixed(2)).toBe('4.75');
  expect(y.daysRatio.toFixed(5)).toBe('0.20219');
  expect(y.redempAndCoup.toFixed(5)).toBe('103.37500');
});

test('yield_before_mat_day_in_year', () => {
  const y = findYTM(
    new Decimal(6.042018),
    new Decimal(1.282004),
    new Decimal(120.63),

    new Decimal(6.75),

    true
  );
  expect(y.YIELD.toFixed(2)).toBe('4.75');
  expect(y.daysRatio.toFixed(5)).toBe('0.69945');
  expect(y.redempAndCoup.toFixed(5)).toBe('103.37500');
});

test('yield_gt_6mo_ahead', () => {
  const y = findYTM(
    new Decimal(8.042018),
    new Decimal(1.282004),
    new Decimal(120.81),

    new Decimal(6.75),

    true
  );
  expect(y.YIELD.toFixed(2)).toBe('4.75');
  expect(y.daysRatio.toFixed(5)).toBe('0.03804');
  expect(y.redempAndCoup.toFixed(5)).toBe('103.37500');
});

test('yield_gt_6mo_behind', () => {
  const y = findYTM(
    new Decimal(1.042018),
    new Decimal(8.282004),
    new Decimal(119.6),

    new Decimal(6.75),

    true
  );
  expect(y.YIELD.toFixed(2)).toBe('4.75');
  expect(y.daysRatio.toFixed(5)).toBe('0.70109');
  expect(y.redempAndCoup.toFixed(5)).toBe('103.37500');
});

test('interactive_yield', () => {
  const store = createCalcStore();
  dispatch(store, 1, 2, 2, '.', 1, 2, 5, 'PV');
  dispatch(store, 6, '.', 7, 5, 'PMT');
  dispatch(store, 4, '.', 2, 8, 2, 0, 0, 4, 'Enter');
  dispatch(store, 6, '.', 0, 4, 2, 0, 1, 8);
  dispatch(store, 'f', 'recipX');
  const st = store.getState();
  expect(st.x.toFixed(2)).toBe('4.60');
  expect(st.N.toFixed(5)).toBe('0.20219');
  expect(st.FV.toFixed(5)).toBe('103.37500');
});

test('interactive_bond', () => {
  const store = createCalcStore();
  dispatch(store, 4, '.', 7, 5, 'I');
  dispatch(store, 6, '.', 7, 5, 'PMT');
  dispatch(store, 4, '.', 2, 8, 2, 0, 0, 4, 'Enter');
  dispatch(store, 6, '.', 0, 4, 2, 0, 1, 8);
  dispatch(store, 'f', 'ytox');
  const st = store.getState();
  expect(st.x.toFixed(2)).toBe('120.38');
  expect(st.y.toFixed(2)).toBe('2.69');
});
