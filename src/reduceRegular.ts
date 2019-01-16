import {ResultState, Action, State, StateUpdate} from './interfaces';
import {add, sub, mul, div, frac, intg, isZero} from './util';
import {Decimal} from 'decimal.js';
import {ONE, NEG_ONE, ZERO, HUNDRED} from './constants';
import {computeN, computeI, computePV, computePMT, computeFV} from './interest';

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
        t: state.z,
        z: state.y,
        y: state.x,
        wasResult: ResultState.ENTER,
      };
    case '.': {
      if (state.dec.equals(ZERO)) {
        return {...state, dec: ONE};
      } else {
        return state;
      }
    }
    case '+':
      return reduceBinaryOp(state, add(state.y, state.x));
    case '-':
      return reduceBinaryOp(state, sub(state.y, state.x));
    case 'times':
      return reduceBinaryOp(state, mul(state.x, state.y));
    case 'div':
      if (isZero(state.x)) {
        return {...state, error: 0};
      }
      return reduceBinaryOp(state, div(state.y, state.x));
    case 'percentTotal': {
      if (isZero(state.y)) {
        return {...state, error: 0};
      }
      return {
        ...state,
        x: mul(div(state.x, state.y), HUNDRED),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
    }
    case 'percentChange': {
      if (isZero(state.y)) {
        return {...state, error: 0};
      }
      return {
        ...state,
        x: mul(div(sub(state.x, state.y), state.y), HUNDRED),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
    }
    case 'percent':
      return {
        ...state,
        x: mul(state.y, div(state.x, HUNDRED)),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
    case 'ytox': {
      if (isZero(state.y) && state.x.lessThanOrEqualTo(0)) {
        return {...state, error: 0};
      }
      return reduceBinaryOp(state, Decimal.pow(state.y, state.x));
    }
    case 'clx':
      // clearing backspaceStates here is probably wrong
      return {
        ...state,
        hasInput: false,
        x: ZERO,
        dec: ZERO,
        xInpPrec: 0,
        wasResult: ResultState.NONE,
        backspaceStates: [],
      };
    case 'sigmaPlus': {
      const registers = state.registers.slice();
      registers[1] = add(registers[1], ONE);
      registers[2] = add(registers[2], state.x);
      registers[3] = add(registers[3], mul(state.x, state.x));
      registers[4] = add(registers[4], state.y);
      registers[5] = add(registers[5], mul(state.y, state.y));
      registers[6] = add(registers[6], mul(state.x, state.y));
      return {
        ...state,
        registers,
        wasResult: ResultState.STATISTICS,
        hasInput: true,
        x: registers[1],
      };
    }
    case 'chs':
      return {...state, x: mul(state.x, NEG_ONE)};
    case 'recipX': {
      if (isZero(state.x)) {
        return {...state, error: 0};
      }
      return {...state, x: div(ONE, state.x), hasInput: true};
    }
    case 'rotateStack':
      return {
        ...state,
        x: state.y,
        y: state.z,
        z: state.t,
        t: state.x,
        hasInput: true,
      };
    case 'f':
      return {...state, wasF: true, wasG: false};
    case 'g':
      return {...state, wasG: true, wasF: false};
    case 'swapxy':
      return {...state, x: state.y, y: state.x, hasInput: true, wasResult: ResultState.REGULAR};
    case 'sto':
      return {...state, wasSto: true, wasRcl: false};
    case 'rcl':
      return {...state, wasRcl: true, wasSto: false};
    case 'N':
      if (state.hasInput) {
        return {...state, N: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computeN(state.I.div(HUNDRED), state.PV, state.PMT, state.FV, state.begEnd);
        return {...state, N: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'I':
      if (state.hasInput) {
        return {...state, I: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computeI(state.N, state.PV, state.PMT, state.FV, state.begEnd).mul(HUNDRED);
        return {...state, I: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'PV':
      if (state.hasInput) {
        return {...state, PV: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computePV(state.N, state.I.div(HUNDRED), state.PMT, state.FV, state.begEnd);
        return {...state, PV: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'PMT':
      if (state.hasInput) {
        return {...state, PMT: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computePMT(state.I.div(HUNDRED), state.N, state.PV, state.FV, state.begEnd);
        return {...state, PMT: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'FV':
      if (state.hasInput) {
        return {...state, FV: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        const p = computeFV(state.N, state.I.div(HUNDRED), state.PV, state.PMT, state.begEnd);
        return {...state, FV: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'runStop':
      if (state.wasResult == ResultState.NONE) {
        return {
          ...state,
          programRunning: !state.programRunning,
          wasResult: ResultState.REGULAR,
          hasInput: false,
        };
      }
      return {...state, programRunning: !state.programRunning};
    case 'EEX': // TODO
    case 'singleStep': {
      console.log('Q@?#$@?#$?@#');
      return state;
    }
    case 'gto': {
      console.log('setting counter to ' + action.gtoTarget);
      return {...state, programCounter: action.gtoTarget};
    }
    default:
      return state;
  }
}

function reduceBinaryOp(state: State, newX: Decimal): State {
  return {
    ...state,
    y: state.z,
    z: state.t,
    x: newX,
    hasInput: true,
    wasResult: ResultState.REGULAR,
  };
}

function reduceNumber(state: State, n: number): State {
  const hasInput = true;
  let y = state.y;
  let x = state.x;
  let xInpPrec = state.xInpPrec;
  let wasResult = state.wasResult;
  let dec = state.dec;

  if (wasResult !== ResultState.NONE) {
    if (wasResult === ResultState.REGULAR || wasResult === ResultState.ENTER) {
      y = x;
    }
    wasResult = ResultState.NONE;
    dec = ZERO;
    x = ZERO;
    xInpPrec = 0;
  }

  const decN = new Decimal(n);
  if (!(x.equals(0) && n === 0)) {
    xInpPrec += 1;
  }
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
    xInpPrec,
  };
  return {...state, ...updates};
}
