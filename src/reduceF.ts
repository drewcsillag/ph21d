import {ResultState, Action, State} from './interfaces';
import {add, sub, mul, div, intg, frac} from './util';
import {ZERO, ONE, INITIAL_REGS, INITIAL_FLOW_COUNTS, HUNDRED, TWO, TWELVE} from './constants';
import Decimal from 'decimal.js';

const konsole = console;

function computeNPV(state: State, intrest: Decimal): Decimal {
  let x = ZERO;
  let ct = 0;
  for (let i = 0; i <= state.N.toNumber(); i++) {
    for (let j = 0; j < state.cashFlowCounts[i].toNumber(); j++) {
      konsole.log('adding ' + state.registers[i] + ' at ' + ct);

      x = add(x, div(state.registers[i], Decimal.pow(add(ONE, intrest), new Decimal('' + ct))));
      // x = x + state.registers[i] / (1 + intrest) ** ct;
      ct += 1;
    }
  }
  return x;
}

function computeIRR(state: State): Decimal {
  let low = new Decimal(-10);
  let high = new Decimal(10);
  let irr = new Decimal(0.0001);

  let lastIrr = ZERO; // THAT MIGHT BE THE PROBLEM (tslint says this is const!)
  let count = 0;
  const epsilon = new Decimal(0.00001);
  while (
    sub(irr, lastIrr)
      .abs()
      .greaterThan(epsilon) &&
    count < 100
  ) {
    lastIrr = irr;
    count += 1;
    const res = computeNPV(state, irr);
    konsole.log(
      'high is ' +
        high +
        ' low is ' +
        low +
        ' count is ' +
        count +
        ' irr is ' +
        irr +
        '  res is ' +
        res
    );
    if (res.lessThan(ZERO)) {
      high = irr;
      irr = div(add(low, high), new Decimal(2));
      konsole.log('picking lower half, irr now ' + irr + ' high is ' + high + ' low is ' + low);
    } else {
      low = irr;
      irr = div(add(low, high), new Decimal(2));
      konsole.log('picking upper half, irr now ' + irr + ' high is ' + high + ' low is ' + low);
    }
  }
  return irr;
}

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
    case 0: // TODO change display to this many decimal digits
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case '.': // TODO display in scientific notation
    case 'Enter':
      return {...state, wasF: false};
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

        wasF: false,
      };
    case 'sigmaPlus': // NOOP
    case 'chs': // NOOP
    case 'recipX': // TODO Calc BOND YTM
    case 'rotateStack': // TODO clear PRGM
    case 'f': // NOOP
    case 'g':
      return {...state, wasF: false, wasG: true};
    case 'swapxy':
      return {...state, N: ZERO, I: ZERO, PMT: ZERO, PV: ZERO, FV: ZERO, wasF: false};
    case 'sto': // NOOP
    case 'rcl': // NOOP
    case 'N': // TODO calc AMORT
    case 'I': // TODO calc INT
    case 'PV': {
      // NPV
      const intrest = div(state.I, HUNDRED);
      const x = computeNPV(state, intrest);
      return {...state, wasResult: ResultState.REGULAR, hasInput: true, wasF: false, x};
    }
    case 'PMT': // TODO calc RND
    case 'FV': {
      // TODO calc IRR
      const i = mul(computeIRR(state), HUNDRED);

      return {...state, wasF: false, x: i, I: i, wasResult: ResultState.REGULAR, hasInput: true};
    }
    case 'runStop': // TODO P/R
    case 'EEX': // NOOP
    case 'singleStep': {
      const registers = state.registers.slice();
      registers[1] = registers[2] = registers[3] = registers[4] = registers[5] = registers[6] = ZERO;
      return {
        ...state,
        wasF: false,
        registers,
      };
    }
    default:
      return state;
  }
}
