import {Action, State, StateUpdate} from 'interfaces';
import {frac, intg, ResultState} from './util';

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
      return {...state, dec: 1};
    case '+':
      return reduceBinaryOp(state, state.y + state.x);
    case '-':
      return reduceBinaryOp(state, state.y - state.x);
    case 'times':
      return reduceBinaryOp(state, state.y * state.x);
    case 'div':
      return reduceBinaryOp(state, state.y / state.x);
    case 'percentTotal':
      return reduceBinaryOp(state, (state.x / state.y) * 100);
    case 'percentChange':
      return reduceBinaryOp(state, ((state.x - state.y) / state.y) * 100);
    case 'percent':
      return reduceBinaryOp(state, state.y * (state.x / 100));
    case 'ytox':
      return reduceBinaryOp(state, state.y ** state.x);
    case 'clx':
      // clearing backspaceStates here is probably wrong
      return {...state, hasInput: false, x: 0, dec: 0, backspaceStates: []};
    case 'sigmaPlus': {
      const registers = state.registers.slice();
      registers[1] += 1;
      registers[2] += state.x;
      registers[3] += state.x * state.x;
      registers[4] += state.y;
      registers[5] += state.y * state.y;
      registers[6] += state.x * state.y;
      return {...state, registers, wasResult: ResultState.STATISTICS, hasInput: true};
    }
    case 'chs':
      return {...state, x: -state.x};
    case 'recipX':
      return {...state, x: 1 / state.x, hasInput: true};
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
  i: number,
  n: number,
  PV: number,
  PMT: number,
  FV: number,
  begEnd: number
) {
  konsole.log(
    'i=' + i + ', n=' + n + ', PV=' + PV + ', PMT=' + PMT + ', FV=' + FV + ', begend=' + begEnd
  );
  // const firstHalf = PV * (1 + i) ** frac(n);
  const fracExp = (1 + i) ** frac(n);
  const firstHalf = PV * fracExp;
  const secondHalf = (1 + i * begEnd) * PMT;
  const bigI = (1 - (1 + i) ** -intg(n)) / i;
  const lastPart = FV * (1 + i) ** -intg(n);

  return firstHalf + secondHalf * bigI + lastPart;
}

function computeN(state: State) {
  let low = 0;
  let high = 99 * 12;

  let i = state.I / 100; // TODO, uhhh, why does lint say this can be const?
  let n = (low + high) / 2; // will iterate to find this
  let lastRes = 0; // TODO again, why does lint say this should be const...?
  let res = 30;
  const epsilon = 0.001;

  let count = 0;
  while (Math.abs(lastRes - res) > epsilon && count < 100) {
    count += 1;
    res = computeCompoundInterest(i, n, state.PV, state.PMT, state.FV, state.begEnd);
    konsole.log(
      'high is ' + high + ' low is ' + low + ' count is ' + count + ' n is ' + n + '  res is ' + res
    );
    if (res < 0) {
      high = n;
      n = (low + high) / 2;
      konsole.log('picking lower half, n now ' + n + ' high is ' + high + ' low is ' + low);
    } else {
      low = n;
      n = (low + high) / 2;
      konsole.log('picking upper half, n now ' + n + ' high is ' + high + ' low is ' + low);
    }
  }
  konsole.log('residual is ', Math.abs(lastRes - res), ' epsilon was ', epsilon);
  return n;
}
function computeI(state: State) {
  let low = 0;
  let high = 100;

  let i = (low + high) / 2; // will iterate to find this
  let lastRes = 0; /// TODO more uhhhh - lint says this could be const
  let res = 30;
  const epsilon = 0.0000001;

  let count = 0;
  while (Math.abs(lastRes - res) > epsilon && count < 100) {
    count += 1;
    res = computeCompoundInterest(i, state.N, state.PV, state.PMT, state.FV, state.begEnd);
    konsole.log(
      'high is ' + high + ' low is ' + low + ' count is ' + count + ' i is ' + i + '  res is ' + res
    );
    if (res > 0) {
      high = i;
      i = (low + high) / 2;
      konsole.log('picking lower half, i now ' + i + ' high is ' + high + ' low is ' + low);
    } else {
      low = i;
      i = (low + high) / 2;
      konsole.log('picking upper half, i now ' + i + ' high is ' + high + ' low is ' + low);
    }
  }
  konsole.log('residual is ', Math.abs(lastRes - res), ' epsilon was ', epsilon);
  return i * 100;
}
function computePMT(state: State) {
  const i = state.I / 100;
  const p1 = state.PV * (1 + i) ** frac(state.N);
  const f1 = state.FV * (1 + i) ** -intg(state.N);
  const bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = 1 + i * state.begEnd;

  return -((p1 + f1) / (b1 * bigI));
}
function computePV(state: State) {
  const i = state.I / 100;
  const f1 = state.FV * (1 + i) ** -intg(state.N);
  const bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = 1 + i * state.begEnd;
  return -((f1 + b1 * state.PMT * bigI) / (1 + i) ** frac(state.N));
}
function computeFV(state: State) {
  const i = state.I / 100;
  const p1 = state.PV * (1 + i) ** frac(state.N);

  const bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  const b1 = 1 + i * state.begEnd;

  return -((p1 + b1 * state.PMT * bigI) / (1 + i) ** -intg(state.N));
}

function reduceBinaryOp(state: State, newX: number): State {
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
    dec = 0;
    x = 0;
  }

  if (dec === 0) {
    x = x * 10 + n;
  } else {
    dec /= 10;
    x += dec * n;
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
