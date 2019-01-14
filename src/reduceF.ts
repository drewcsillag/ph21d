import {ResultState, Action, State} from './interfaces';
import {add, sub, mul, div, intg, frac, computeDisplayWithoutCommas} from './util';
import {ZERO, ONE, INITIAL_REGS, INITIAL_FLOW_COUNTS, HUNDRED, TWO, TWELVE} from './constants';
import Decimal from 'decimal.js';
import {computeNPV, computeIRR} from './interest';

function SOYDk(k: Decimal) {
  const W = intg(k);
  const F = frac(k);
  const numerator = mul(add(W, ONE), add(W, mul(F, TWO)));
  return div(numerator, TWO);
}

function SOYDDepreciation(L: Decimal, j: Decimal, SBV: Decimal, SAL: Decimal) {
  const DPNjFirst = div(add(sub(L, j), ONE), SOYDk(L));
  const DPNjSecond = sub(SBV, SAL);
  const DPNj = mul(DPNjFirst, DPNjSecond);
  return DPNj;
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
    case 'Enter':
      return {...state, wasF: false, wasG: false, wasRcl: false, wasSto: false, wasGto: false};
    case '+': // TODO clear F and defer to regular
    case '-': // TODO clear F and defer to regular
    case 'times': // TODO clear F and defer to regular
    case 'div': // TODO clear F and defer to regular

    case 'percentTotal': {
      // SL
      // let pv = //original cost
      // pet fv = //salvage value
      // let n = //useful life

      // dbfactor i
      // x is the year for things to be calculated
      // let j = state.x;
      let x = ZERO;
      let y = ZERO;

      if (state.x.lessThan(ZERO)) {
        //  TODO error 5
      }
      if (state.x <= state.N) {
        const depreciable = sub(state.PV, state.FV);
        x = div(depreciable, state.N);
        // x = (state.PV - state.FV) / state.N;

        y = sub(depreciable, mul(x, state.x)); //sub(state.PV, sub(state.FV, mul(x, state.x)));
        // y = state.PV - state.FV - x * state.x;
      }
      // x = depreciation
      // y = remaining amount of depreciable
      return {
        ...state,
        x,
        y,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        wasG: false,
      };
    }
    case 'percentChange': {
      const L = state.N;
      const j = state.x;
      const SBV = state.PV;
      const SAL = state.FV;

      const DPNj = SOYDDepreciation(L, j, SBV, SAL);

      let RDV = sub(SBV, SAL);
      for (let i = 1; i <= j.toNumber(); i++) {
        const toSub = SOYDDepreciation(L, new Decimal(i), SBV, SAL);
        RDV = sub(RDV, toSub);
      }
      return {
        ...state,
        x: DPNj,
        y: RDV,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        wasG: false,
      };
    }
    case 'percent': {
      const L = state.N;
      const j = state.x;
      const SBV = state.PV;
      const SAL = state.FV;
      const FACT = div(state.I, HUNDRED);
      const Y1 = TWELVE; // for now

      let i = intg(j).toNumber();
      const factOver100L = div(FACT, L);
      const Y1OverTwelve = div(Y1, TWELVE);
      const DPN1 = mul(SBV, mul(factOver100L, Y1OverTwelve));
      let RBV = sub(SBV, DPN1);
      let DPNj: Decimal = DPN1;
      while (i > 1) {
        DPNj = mul(RBV, div(FACT, L));
        RBV = sub(RBV, DPNj);
        i -= 1;
      }
      const RDV = sub(RBV, SAL);
      return {
        ...state,
        x: DPNj,
        y: RDV,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
        wasG: false,
      };
    }

    case 'ytox': // TODO calc BOND PRICE
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
      };
    case 'sigmaPlus': // NOOP
    case 'chs': // NOOP
    case 'recipX': // TODO Calc BOND YTM
    case 'rotateStack': // NNOP
    case 'f': // NOOP
    case 'g':
      return {...state, wasF: false, wasG: true};
    case 'swapxy':
      return {...state, N: ZERO, I: ZERO, PMT: ZERO, PV: ZERO, FV: ZERO, wasF: false};
    case 'sto': // NOOP
    case 'rcl': // NOOP
    case 'N': {
      // AMORT

      let totalI: Decimal = ZERO;
      let totalP: Decimal = ZERO;
      let N = state.N;
      let PV = state.PV;
      let PMT = state.PMT;

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
        y: y.negated(),
        wasResult: ResultState.REGULAR,
        hasInput: true,
        wasF: false,
      };
    }

    case 'PV': {
      // NPV
      const interest = div(state.I, HUNDRED);
      const x = computeNPV(state.N, state.cashFlowCounts, state.registers, interest);
      return {...state, wasResult: ResultState.REGULAR, hasInput: true, wasF: false, x};
    }
    case 'PMT': {
      const disp = new Decimal(computeDisplayWithoutCommas(state.x, state.fPrecision));
      return {...state, wasResult: ResultState.REGULAR, hasInput: true, wasF: false, x: disp};
    }
    case 'FV': {
      const i = mul(computeIRR(state.N, state.cashFlowCounts, state.registers), HUNDRED);

      return {...state, wasF: false, x: i, I: i, wasResult: ResultState.REGULAR, hasInput: true};
    }
    case 'runStop':
      return {...state, wasF: false, programMode: true};
    case 'EEX': // NOOP
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
