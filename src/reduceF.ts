import Decimal from 'decimal.js';
import {
  HUNDRED,
  INITIAL_FLOW_COUNTS,
  INITIAL_REGS,
  ONE,
  TWELVE,
  TWENTY,
  TWO,
  ZERO,
} from './constants';
import {DB, SL, SOYD} from './depreciation';
import {computeIRR, computeNPV} from './interest';
import {Action, ResultState, State} from './interfaces';
import {calcApp} from './redux_actions';
import {add, computeDisplayWithoutCommas, div, frac, intg, mul, sub} from './util';

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
    case 'ytox': // TODO calc BOND PRICE

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
      let totalI: Decimal = ZERO;
      let totalP: Decimal = ZERO;
      let N = state.N;
      let PV = state.PV;
      const PMT = state.PMT;

      for (let i = 0; i < state.x.toNumber(); i++) {
        const rawI = state.I.div(100).mul(PV);
        const thisI = new Decimal(computeDisplayWithoutCommas(rawI, state.fPrecision));
        const thisP = PMT.add(thisI);
        totalI = totalI.add(thisI);
        totalP = totalP.add(thisP);
        PV = PV.add(thisP);
        N = N.add(ONE);
      }

      return {
        ...state,
        x: totalI.mul(PMT.s),
        y: totalP,
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
      const N = state.N;
      const PV = state.PV;
      const I = state.I.div(100);
      const x = N.div(360)
        .mul(PV)
        .mul(I);
      const y = N.div(365)
        .mul(PV)
        .mul(I);
      return {
        ...state,
        x: x.negated(),
        y: PV.negated(),
        z: y.negated(),
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
      const interest = div(state.I, HUNDRED);
      const x = computeNPV(state.N, state.cashFlowCounts, state.registers, interest);
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
