import Decimal from 'decimal.js';
import {bondPrice} from './bonds';
import {HUNDRED, INITIAL_FLOW_COUNTS, INITIAL_REGS, TWELVE, TWENTY, ZERO} from './constants';
import {DB, SL, SOYD} from './depreciation';
import {amort, computeIRR, computeNPV, interest} from './interest';
import {Action, ResultState, State} from './interfaces';
import {calcApp} from './redux_actions';
import {computeDisplayWithoutCommas, div, intg, mul} from './util';

// return true if there's a problem
function depreciationCheck(state: State): boolean {
  if (state.N.lessThanOrEqualTo(ZERO)) {
    return true;
  }
  if (state.N.greaterThan(new Decimal('10e+10'))) {
    return true;
  }
  if (state.x.lessThanOrEqualTo(ZERO)) {
    return true;
  }
  if (!intg(state.x).equals(state.x)) {
    return true;
  }
  return false;
}

export function reduceF(state: State, action: Action): State {
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
      return {...state, fPrecision: action.type, wasF: false};
    case '.':
      return {...state, fPrecision: -1, wasF: false};
    case 'Enter': {
      return {
        ...state,
        wasF: false,
        wasG: false,
        wasRcl: false,
        wasSto: false,
        wasGto: false,
        displaySpecial: state.x.toPrecision(10).replace('.', ''),
      };
    }
    case '+': // clear F and defer to regular
    case '-': // clear F and defer to regular
    case 'times': // clear F and defer to regular
    case 'div': // clear F and defer to regular
      return calcApp({...state, wasF: false}, action);

    case 'percentTotal': {
      // SL
      if (depreciationCheck(state)) {
        return {...state, error: 5};
      }
      const [x, y] = SL(state.x, state.N, state.PV, state.FV);
      // x = depreciation
      // y = remaining amount of depreciable
      return {
        ...state,
        x,
        y,
        z: state.x,
        t: state.y,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        wasG: false,
      };
    }
    case 'percentChange': {
      if (depreciationCheck(state)) {
        return {...state, error: 5};
      }
      const [x, y] = SOYD(state.N, state.x, state.PV, state.FV);
      return {
        ...state,
        x,
        y,
        z: state.x,
        t: state.y,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        wasG: false,
      };
    }
    case 'percent': {
      if (depreciationCheck(state)) {
        return {...state, error: 5};
      }
      const FACT = div(state.I, HUNDRED);

      const [x, y] = DB(state.x, state.N, state.PV, state.FV, FACT, TWELVE);

      return {
        ...state,
        x,
        y,
        z: state.x,
        t: state.y,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        wasG: false,
      };
    }

    case 'clx':
      return {
        ...state,
        registers: INITIAL_REGS,
        cashFlowCounts: INITIAL_FLOW_COUNTS,
        N: ZERO,
        I: ZERO,
        PV: ZERO,
        PMT: ZERO,
        FV: ZERO,
        x: ZERO,
        y: ZERO,
        z: ZERO,
        t: ZERO,
        lastX: ZERO,
        wasF: false,
        eexValue: null,
      };
    case 'recipX': // TODO Calc BOND YTM
    case 'ytox': {
      const res = bondPrice(state.y, state.x, state.I, state.PMT, state.mDotDY);

      if (res.error) {
        return {...state, error: 8, wasF: false};
      }

      return {...state, wasF: false, x: res.price, y: res.accruedInterest};
    }
    case 'EEX': // NOOP
    case 'sigmaPlus': // NOOP
    case 'chs': // NOOP
    case 'rotateStack': // NNOP
    case 'f': // NOOP
    case 'sto': // NOOP
    case 'rcl': // NOOP
      return {...state, wasF: false};
    case 'g':
      return {...state, wasF: false, wasG: true};
    case 'swapxy':
      return {...state, N: ZERO, I: ZERO, PMT: ZERO, PV: ZERO, FV: ZERO, wasF: false};

    case 'N': {
      // AMORT

      if (state.x.lessThanOrEqualTo(ZERO) || !intg(state.x).equals(state.x)) {
        return {...state, error: 5};
      }
      const [x, y, PV, N] = amort(state.x, state.I, state.N, state.PV, state.PMT, state.fPrecision);

      return {
        ...state,
        x,
        y,
        z: state.x,
        PV,
        N,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
      };
    }
    case 'I': {
      // INT
      const [x, y, z] = interest(state.N, state.PV, state.I);
      return {
        ...state,
        x,
        y,
        z,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
      };
    }

    case 'PV': {
      // NPV
      if (state.N.greaterThan(TWENTY) || state.N.lessThan(ZERO) || !intg(state.N).equals(state.N)) {
        return {...state, error: 6};
      }
      if (state.I.div(HUNDRED).lessThanOrEqualTo(HUNDRED.negated())) {
        return {...state, error: 5};
      }
      const i = div(state.I, HUNDRED);
      const x = computeNPV(state.N, state.cashFlowCounts, state.registers, i);
      return {...state, wasResult: ResultState.REGULAR, hasInput: true, wasF: false, x};
    }
    case 'PMT': {
      // RND
      const disp = new Decimal(computeDisplayWithoutCommas(state.x, state.fPrecision));
      return {
        ...state,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        x: disp,
        lastX: state.x,
      };
    }
    case 'FV': {
      // IRR
      if (state.N.greaterThan(TWENTY) || state.N.lessThan(ZERO) || !intg(state.N).equals(state.N)) {
        return {...state, error: 6};
      }
      const sign = state.registers[0].s;
      let ok = false;
      for (let j = 0; j <= state.N.toNumber(); j++) {
        if (sign !== state.registers[j].s) {
          ok = true;
          break;
        }
      }
      if (!ok) {
        return {...state, error: 5};
      }
      const i = mul(computeIRR(state.N, state.cashFlowCounts, state.registers), HUNDRED);

      return {...state, wasF: false, x: i, I: i, wasResult: ResultState.REGULAR, hasInput: true};
    }
    case 'runStop':
      return {...state, wasF: false, programEditCounter: state.programCounter, programMode: true};
    case 'singleStep': {
      const registers = state.registers.slice();
      registers[1] = registers[2] = registers[3] = registers[4] = registers[5] = registers[6] = ZERO;
      return {
        ...state,
        wasF: false,
        registers,
        x: ZERO,
        y: ZERO,
        z: ZERO,
        t: ZERO,
      };
    }
    default:
      return state;
  }
}
