import {Decimal} from 'decimal.js';
import {HUNDRED, NEG_ONE, ONE, TEN, ZERO} from './constants';
import {computeFV, computeI, computeN, computePMT, computePV} from './interest';
import {Action, makeRegisterBundle, ResultState, State, StateUpdate} from './interfaces';
import {addPoint} from './stats';
import {add, div, isZero, mul, sub} from './util';

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
        wasResult: ResultState.NOLIFT,
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
        lastX: state.x,
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
        lastX: state.x,
      };
    }
    case 'percent':
      return {
        ...state,
        x: mul(state.y, div(state.x, HUNDRED)),
        hasInput: true,
        wasResult: ResultState.REGULAR,
        lastX: state.x,
      };
    case 'ytox': {
      if (isZero(state.y) && state.x.lessThanOrEqualTo(ZERO)) {
        return {...state, error: 0};
      }
      return reduceBinaryOp(state, Decimal.pow(state.y, state.x));
    }
    case 'clx': {
      return {
        ...state,
        hasInput: false,
        x: ZERO,
        dec: ZERO,
        xInpPrec: 0,
        wasResult: ResultState.NONE,
        backspaceStates: [],
        eexValue: null,
      };
    }
    case 'sigmaPlus': {
      const registers = state.registers.slice();
      const updated = addPoint(state.x, state.y, makeRegisterBundle(state));
      registers[1] = updated.n;
      registers[2] = updated.sumX;
      registers[3] = updated.sumX2;
      registers[4] = updated.sumY;
      registers[5] = updated.sumY2;
      registers[6] = updated.sumXY;

      return {
        ...state,
        registers,
        wasResult: ResultState.NOLIFT,
        hasInput: true,
        x: registers[1],
        lastX: state.x,
      };
    }
    case 'chs':
      return {...state, x: mul(state.x, NEG_ONE)};
    case 'recipX': {
      if (isZero(state.x)) {
        return {...state, error: 0};
      }
      return {...state, lastX: state.x, x: div(ONE, state.x), hasInput: true};
    }
    case 'rotateStack':
      return {
        ...state,
        x: state.y,
        y: state.z,
        z: state.t,
        t: state.x,
        hasInput: true,
        wasResult: ResultState.NOLIFT,
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
        if (
          // sign issue with what's in the doc
          state.PMT.greaterThanOrEqualTo(state.PV.negated().mul(state.I.div(HUNDRED))) ||
          state.PMT.equals(state.FV.mul(state.I.div(HUNDRED))) ||
          state.I.div(HUNDRED).lessThanOrEqualTo(HUNDRED.negated())
        ) {
          console.log('err?: ', state.PMT < state.PV.negated().mul(state.I.div(HUNDRED)));
          console.log('err?:', state.PMT.equals(state.FV.mul(state.I.div(HUNDRED))));
          console.log('err?:', state.I.div(HUNDRED).lessThanOrEqualTo(HUNDRED.negated()));
          return {...state, error: 5};
        }
        const p = computeN(state.I.div(HUNDRED), state.PV, state.PMT, state.FV, state.begEnd);
        // TODO, provide a way to detech and report than there is no valid value of N it can find.
        return {...state, N: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'I':
      if (state.hasInput) {
        return {...state, I: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        if (state.PMT.equals(ZERO) && state.N.lessThan(ZERO)) {
          return {...state, error: 5};
        }
        const p = computeI(state.N, state.PV, state.PMT, state.FV, state.begEnd).mul(HUNDRED);
        return {...state, I: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'PV':
      if (state.hasInput) {
        return {...state, PV: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        if (state.I.div(HUNDRED).lessThanOrEqualTo(HUNDRED.negated())) {
          return {...state, error: 5};
        }
        const p = computePV(state.N, state.I.div(HUNDRED), state.PMT, state.FV, state.begEnd);
        return {...state, PV: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'PMT':
      if (state.hasInput) {
        return {...state, PMT: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        if (
          state.N.equals(ZERO) ||
          state.I.equals(ZERO) ||
          state.I.div(HUNDRED).lessThanOrEqualTo(HUNDRED.negated())
        ) {
          return {...state, error: 5};
        }
        const p = computePMT(state.I.div(HUNDRED), state.N, state.PV, state.FV, state.begEnd);
        return {...state, PMT: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'FV':
      if (state.hasInput) {
        return {...state, FV: state.x, hasInput: false, wasResult: ResultState.REGULAR};
      } else {
        if (state.I.div(HUNDRED).lessThanOrEqualTo(HUNDRED.negated())) {
          return {...state, error: 5};
        }
        const p = computeFV(state.N, state.I.div(HUNDRED), state.PV, state.PMT, state.begEnd);
        return {...state, FV: p, x: p, hasInput: false, wasResult: ResultState.REGULAR};
      }
    case 'runStop':
      if (state.wasResult === ResultState.NONE) {
        return {
          ...state,
          programRunning: !state.programRunning,
          wasResult: ResultState.REGULAR,
          hasInput: false,
        };
      }
      return {...state, programRunning: !state.programRunning};
    case 'EEX': {
      return {...state, eexValue: {origX: state.x, exponent: 0, positive: true}};
    }
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
    lastX: state.x,
    wasResult: ResultState.REGULAR,
  };
}

function reduceNumber(state: State, n: number): State {
  const hasInput = true;
  let y = state.y;
  let x = state.x;
  let z = state.z;
  let t = state.t;
  let xInpPrec = state.xInpPrec;
  let wasResult = state.wasResult;
  let dec = state.dec;

  if (wasResult !== ResultState.NONE) {
    if (wasResult === ResultState.REGULAR) {
      t = z;
      z = y;
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
  if (xInpPrec > 10) {
    return state;
  }
  if (dec.eq(ZERO)) {
    const tenX = TEN.mul(x);
    x = add(tenX, decN);
    // x = x * 10 + n;
  } else {
    dec = div(dec, TEN);
    x = add(x, mul(dec, decN));
    // x += dec * n;
  }
  const updates: StateUpdate = {
    x,
    y,
    z,
    t,
    dec,
    hasInput,
    wasResult,
    xInpPrec,
  };
  return {...state, ...updates};
}

export function reduceEex(state: State, action: Action): State {
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
    case 9: {
      const eexValue = state.eexValue;
      const positive = eexValue.positive;
      const exponent = (eexValue.exponent * 10 + action.type) % 100;
      return {
        ...state,
        eexValue: {origX: eexValue.origX, positive, exponent},
        x: new Decimal(eexValue.origX.toString() + 'e' + (positive ? '+' : '-') + exponent),
      };
    }
    case 'chs': {
      return {...state, eexValue: {...state.eexValue, positive: false}};
    }
    default:
      return null;
  }
}
