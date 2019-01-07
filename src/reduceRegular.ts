import {Action, State, StateUpdate} from 'interfaces';
import {add, sub, mul, div, frac, intg, ResultState} from './util';
import {Decimal} from 'decimal.js';
import {ONE, NEG_ONE, ZERO, HUNDRED} from './constants';

const konsole = console;

export function reduceRegular(state: State, action: Action): State {
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      return reduceNumber(state, action.type);
    case 'Enter':
      return {
        ...state,
        stack4: state.stack3,
        stack3: state.y,
        y: state.x,
        wasResult: ResultState.ENTER,
      };
    case '.':
      return {...state, dec: ONE};
    case '+':
      return reduceBinaryOp(state, add(state.y, state.x));
    case '-':
      return reduceBinaryOp(state, sub(state.y, state.x));
    case 'times':
      return reduceBinaryOp(state, mul(state.x, state.y));
    case 'div':
      return reduceBinaryOp(state, div(state.y, state.x));
    case 'percentTotal':
      return reduceBinaryOp(state, mul(div(state.x, state.y), HUNDRED));
    case 'percentChange':
      return reduceBinaryOp(state, mul(div(sub(state.x, state.y), state.y), HUNDRED));
    case 'percent':
      return reduceBinaryOp(state, mul(state.y, div(state.x, HUNDRED)));
    case 'ytox':
      return reduceBinaryOp(state, Decimal.pow(state.y, state.x));
    case 'clx':
      // clearing backspaceStates here is probably wrong
      return {...state, hasInput: false, x: ZERO, dec: ZERO, backspaceStates: []};
    case 'sigmaPlus': {
      const registers = state.registers.slice();
      registers[1] = add(registers[1], ONE);
      registers[2] = add(registers[2], state.x);
      registers[3] = add(registers[3], mul(state.x, state.x));
      registers[4] = add(registers[4], state.y);
      registers[5] = add(registers[5], mul(state.y, state.y));
      registers[6] = add(registers[6], mul(state.x, state.y));
      return {...state, registers, wasResult: ResultState.STATISTICS, hasInput: true};
    }
    case 'chs':
      return {...state, x: mul(state.x, NEG_ONE)};
    case 'recipX':
      return {...state, x: div(ONE, state.x), hasInput: true};
    case 'rotateStack':
      return {
        ...state,
        x: state.y,
        y: state.stack3,
        stack3: state.stack4,
        stack4: state.x,
        hasInput: true,
      };
    case 'f':
      return {...state, wasF: true, wasG: false};
    case 'g':
      return {...state, wasG: true, wasF: false};
    case 'swapxy':
      return {...state, x: state.y, y: state.x, hasInput: true};
    case 'sto':
      return {...state, wasSto: true, wasRcl: false};
    case 'rcl':
      return {...state, wasRcl: true, wasSto: false};
    case 'N':
      if (state.hasInput) {
        return {...state, N: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computeN(state);
        return {...state, N: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'I':
      if (state.hasInput) {
        return {...state, I: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computeI(state);
        return {...state, I: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'PV':
      if (state.hasInput) {
        return {...state, PV: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computePV(state);
        return {...state, PV: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'PMT':
      if (state.hasInput) {
        return {...state, PMT: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computePMT(state);
        return {...state, PMT: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'FV':
      if (state.hasInput) {
        return {...state, FV: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computeFV(state);
        return {...state, FV: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'runStop': // TODO
    case 'EEX': // TODO
    case 'singleStep': // TODO
    default:
      return state;
  }
}

function computeCompoundInterest(
  i: Decimal,
  n: Decimal,
  PV: Decimal,
  PMT: Decimal,
  FV: Decimal,
  begEnd: Decimal
) {
  konsole.log(
    'i=' + i + ', n=' + n + ', PV=' + PV + ', PMT=' + PMT + ', FV=' + FV + ', begend=' + begEnd
  );
  // const firstHalf = PV * (1 + i) ** frac(n);
  const fracExp = ONE; // (1 + i) ** frac(n);
  const firstHalf = mul(PV, fracExp);
  const secondHalf = mul(add(ONE, mul(begEnd, i)), PMT);
  // const secondHalf = (1 + i * begEnd) * PMT;

  const plus1 = add(ONE, i);
  const negIntgN = mul(NEG_ONE, intg(n));
  const powed = Decimal.pow(plus1, negIntgN);
  const oneMinusPowed = sub(ONE, powed);
  const bigI = div(oneMinusPowed, i);
  // const bigI = (1 - (1 + i) ** -intg(n)) / i;

  const lastPart = mul(FV, powed);
  // const lastPart = FV * (1 + i) ** -intg(n);

  return add(add(mul(secondHalf, bigI), firstHalf), lastPart);
  // return firstHalf + secondHalf * bigI + lastPart;
}

function computeN(state: State): Decimal {
  let low = ZERO;
  let high = mul(new Decimal('99'), new Decimal('12'));

  function getNewN() {
    return div(add(low, high), new Decimal(2));
  }
  const i = div(state.I, HUNDRED);
  let n = getNewN(); // will iterate to find this
  let res = new Decimal('30');
  const epsilon = new Decimal('0.001');
  let lastN = low;
  let count = 0;
  while (
    sub(lastN, n)
      .abs()
      .greaterThan(epsilon) &&
    count < 100
  ) {
    lastN = n;
    count += 1;
    res = computeCompoundInterest(i, n, state.PV, state.PMT, state.FV, state.begEnd);
    if (
      sub(lastN, n)
        .abs()
        .greaterThan(epsilon)
    ) {
      konsole.log('res is small enough at ' + res);
      break;
    }
    konsole.log('' + [low, n, high] + ' count is ' + count + ' n is ' + n + '  res is ' + res);
    if (res.lessThan(ZERO)) {
      high = n;
      n = getNewN();
      konsole.log('picking lower half, ' + [low, n, high]);
    } else {
      low = n;
      n = getNewN();
      konsole.log('picking upper half, ' + [low, n, high]);
    }
  }
  konsole.log('residual is ', res.abs(), ' epsilon was ', epsilon);
  return n;
}
function computeI(state: State): Decimal {
  let low = ZERO;
  let high = HUNDRED;

  function getNewI() {
    return div(add(low, high), new Decimal(2));
  }
  let i = getNewI(); // will iterate to find this
  const lastI = low;
  let res = new Decimal(30);
  const epsilon = new Decimal(0.00000001);

  let count = 0;
  while (
    sub(lastI, i)
      .abs()
      .greaterThan(epsilon) &&
    count < 100
  ) {
    count += 1;
    res = computeCompoundInterest(i, state.N, state.PV, state.PMT, state.FV, state.begEnd);
    if (
      sub(lastI, i)
        .abs()
        .greaterThan(epsilon)
    ) {
      konsole.log('res is small enough at ' + res);
      break;
    }
    konsole.log(
      'high is ' + high + ' low is ' + low + ' count is ' + count + ' i is ' + i + '  res is ' + res
    );
    if (res.greaterThan(ZERO)) {
      high = i;
      i = getNewI();
      konsole.log('picking lower half, i now ' + i + ' high is ' + high + ' low is ' + low);
    } else {
      low = i;
      i = getNewI();
      konsole.log('picking upper half, i now ' + i + ' high is ' + high + ' low is ' + low);
    }
  }
  konsole.log('residual is ', res.abs(), ' epsilon was ', epsilon);
  return mul(i, HUNDRED);
}
function computePMT(state: State): Decimal {
  const i = div(state.I, HUNDRED);

  const p1 = mul(state.PV, Decimal.pow(add(ONE, i), frac(state.N)));
  // const p1 = state.PV * (1 + i) ** frac(state.N);
  const powed = Decimal.pow(add(ONE, i), mul(NEG_ONE, intg(state.N)));
  const f1 = mul(state.FV, powed);
  // const f1 = state.FV * (1 + i) ** -intg(state.N);
  const bigI = div(sub(ONE, powed), i);
  // const bigI =     (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = add(ONE, mul(i, state.begEnd));
  // const b1 = 1 + i * state.begEnd;

  return mul(div(add(p1, f1), mul(b1, bigI)), NEG_ONE);
  // return -((p1 + f1) / (b1 * bigI));
}

function computePV(state: State): Decimal {
  const i = div(state.I, HUNDRED);
  //const i = state.I / 100;

  const powed = Decimal.pow(add(ONE, i), mul(NEG_ONE, intg(state.N)));
  const f1 = mul(state.FV, powed);
  // const f1 = state.FV * (1 + i) ** -intg(state.N);
  const bigI = div(sub(ONE, powed), i);
  // const bigI =        (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = add(ONE, mul(i, state.begEnd));
  // const b1 = 1 + i * state.begEnd;

  const firstHalf = add(f1, mul(mul(b1, state.PMT), bigI));
  // const firstHalf = f1 + b1 * state.PMT * bigI
  const secondHalf = Decimal.pow(add(ONE, i), frac(state.N));
  // const secondHalf = (1 + i) ** frac(state.N);
  return mul(NEG_ONE, div(firstHalf, secondHalf));
  // return -(firstHalf / secondHalf);
}
function computeFV(state: State): Decimal {
  const i = div(state.I, HUNDRED);
  // const i = state.I / 100;

  const p1 = mul(state.PV, Decimal.pow(add(ONE, i), frac(state.N)));
  // const p1 = state.PV * (1 + i) ** frac(state.N);

  const powed = Decimal.pow(add(ONE, i), mul(NEG_ONE, intg(state.N)));
  const bigI = div(sub(ONE, powed), i);
  // const bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = add(mul(i, state.begEnd), ONE);
  // const b1 = 1 + i * state.begEnd;

  return mul(NEG_ONE, div(add(p1, mul(mul(b1, state.PMT), bigI)), powed));
  // return -((p1 + b1 * state.PMT * bigI) / (1 + i) ** -intg(state.N));
}

function reduceBinaryOp(state: State, newX: Decimal): State {
  return {
    ...state,
    y: state.stack3,
    stack3: state.stack4,
    x: newX,
    hasInput: true,
    wasResult: ResultState.REGULAR,
  };
}

function reduceNumber(state: State, n: number): State {
  const hasInput = true;
  let y = state.y;
  let x = state.x;
  let wasResult = state.wasResult;
  let dec = state.dec;

  if (wasResult !== ResultState.NONE) {
    if (wasResult === ResultState.REGULAR || wasResult === ResultState.ENTER) {
      y = x;
    }
    wasResult = ResultState.NONE;
    dec = ZERO;
    x = ZERO;
  }

  const decN = new Decimal(n);
  if (dec.eq(ZERO)) {
    let ten = new Decimal(10);
    let tenX = ten.mul(x);
    x = add(tenX, decN);
    // x = x * 10 + n;
  } else {
    dec = div(dec, new Decimal(10));
    x = add(x, mul(dec, decN));
    // x += dec * n;
  }
  const updates: StateUpdate = {
    x,
    y,
    dec,
    hasInput,
    wasResult,
  };
  return {...state, ...updates};
}
