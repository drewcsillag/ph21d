import Decimal from 'decimal.js';
import {initialState} from './constants';
import {ActionType, digit, ResultState, State} from './interfaces';
import {createCalcStore} from './redux_actions';

test('stoRclRegularRegs', () => {
  const store = createCalcStore();
  for (let i = 0; i < 20; i++) {
    const preState: State = store.getState();
    store.dispatch({type: 'setState', value: {...preState, x: new Decimal(200 + i)}});
    store.dispatch({type: 'sto'});
    if (i > 9) {
      store.dispatch({type: '.'});
    }
    const reg: digit = (i % 10) as digit;
    store.dispatch({type: reg});

    const afterState: State = store.getState();

    expect(afterState.registers[i].toNumber()).toBe(200 + i);
  }
});

function regsWith(regNo: number, value: number) {
  const regs = initialState.registers.slice();
  regs[regNo] = new Decimal(value);
  return regs;
}

test('stoOperatorRegs0To4', () => {
  const store = createCalcStore();
  const ops: ActionType[] = ['+', '-', 'div', 'times'];
  for (let i = 0; i < 4; i++) {
    for (const op of ops) {
      const initRegVal = 200 + i;
      const secondVal = 5 + i;

      store.dispatch({
        type: 'setState',
        value: {...initialState, registers: regsWith(i, initRegVal), x: new Decimal(secondVal)},
      });
      store.dispatch({type: 'sto'});
      store.dispatch({type: op});
      store.dispatch({type: i as ActionType});
      const afterState = store.getState();
      const regVal = afterState.registers[i].toNumber();
      //   console.log('initial ' + initRegVal + ' secondVal ' + secondVal, ' op ' + op);
      let expectVal;
      if (op === '+') {
        expectVal = initRegVal + secondVal;
      } else if (op === '-') {
        expectVal = initRegVal - secondVal;
      } else if (op === 'times') {
        expectVal = initRegVal * secondVal;
      } else if (op === 'div') {
        expectVal = initRegVal / secondVal;
      }
      console.log('expecting register ' + i + ' to be ' + expectVal);
      expect(regVal).toBeCloseTo(expectVal, 5);
    }
  }
});

test('rclFinancials', () => {
  const store = createCalcStore();
  const regs: ActionType[] = ['N', 'I', 'PV', 'PMT', 'FV'];

  let count = new Decimal(1);
  for (const reg of regs) {
    console.log('rclFinancials reg is ' + reg);
    store.dispatch({
      type: 'setState',
      value: {...initialState, wasResult: ResultState.REGULAR, hasInput: true, x: count},
    });

    store.dispatch({type: reg});
    const afterStoState = store.getState() as any;
    expect(afterStoState[reg]).toBe(count);

    store.dispatch({type: 'rcl'});
    store.dispatch({type: reg});
    expect(store.getState().x).toBe(count);
    count = count.add(1);
  }
});

test('stoRclFinancials', () => {
  const store = createCalcStore();
  const regs: ActionType[] = ['N', 'I', 'PV', 'PMT', 'FV'];

  let count = new Decimal(1);
  for (const reg of regs) {
    console.log('rclFinancials reg is ' + reg);
    store.dispatch({
      type: 'setState',
      value: {...initialState, wasResult: ResultState.REGULAR, hasInput: true, x: count},
    });

    store.dispatch({type: 'sto'});
    store.dispatch({type: reg});
    const afterStoState = store.getState() as any;
    expect(afterStoState[reg]).toBe(count);

    store.dispatch({type: 'rcl'});
    store.dispatch({type: reg});
    expect(store.getState().x).toBe(count);
    count = count.add(1);
  }
});

test('rclSpecialsWithG', () => {
  const store = createCalcStore();
  store.dispatch({type: 5});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'I'});
  expect(store.getState().I.toNumber()).toBeCloseTo(5 / 12.0, 5);
  store.dispatch({type: 'clx'});
  store.dispatch({type: 'rcl'});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'I'});
  expect((store.getState().x as Decimal).toNumber()).toBe(5);

  store.dispatch({type: 'clx'});
  store.dispatch({type: 5});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'N'});
  expect(store.getState().N.toNumber()).toBe(60);
  store.dispatch({type: 'clx'});
  store.dispatch({type: 'rcl'});
  store.dispatch({type: 'g'});
  store.dispatch({type: 'N'});
  expect((store.getState().x as Decimal).toNumber()).toBe(5);
});
