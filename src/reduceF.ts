import {State, Action} from 'interfaces';
const konsole = console;

function computeNPV(state: State, intrest: number) {
  let x = 0;
  let ct = 0;
  for (let i = 0; i <= state.N; i++) {
    for (let j = 0; j < state.cashFlowCounts[i]; j++) {
      konsole.log('adding ' + state.registers[i] + ' at ' + ct);
      x = x + state.registers[i] / (1 + intrest) ** ct;
      ct += 1;
    }
  }
  return x;
}

function computeIRR(state: State) {
  let low = -10;
  let high = 10;
  let irr = 0.0001;

  let lastIrr = 0;
  let count = 0;
  let epsilon = 0.00001;
  while (Math.abs(irr - lastIrr) > epsilon && count < 100) {
    count += 1;
    let res = computeNPV(state, irr);
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
    if (res < 0) {
      high = irr;
      irr = (low + high) / 2;
      konsole.log('picking lower half, irr now ' + irr + ' high is ' + high + ' low is ' + low);
    } else {
      low = irr;
      irr = (low + high) / 2;
      konsole.log('picking upper half, irr now ' + irr + ' high is ' + high + ' low is ' + low);
    }
  }
  return irr;
}

export function reduceF(state: State, action: Action) {
  switch (action.type) {
    case 0: //TODO change display to this many decimal digits
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
    case '+': //TODO clear F and defer to regular
    case '-': //TODO clear F and defer to regular
    case 'times': //TODO clear F and defer to regular
    case 'div': //TODO clear F and defer to regular

    case 'percentTotal': {
      //SL
      // let pv = //original cost
      // pet fv = //salvage value
      // let n = //useful life

      //dbfactor i
      // x is the year for things to be calculated
      // let j = state.x;
      let x = 0;
      let y = 0;

      if (state.x < 0) {
        //  TODO error 5
      }
      if (state.x <= state.N) {
        x = (state.PV - state.FV) / state.N;
        y = state.PV - state.FV - x * state.x;
      }
      // x = depreciation
      // y = remaining book value
      return {...state, x, y, wasResult: 1, hasInput: 1, wasF: false, wasG: false};
    }
    case 'percentChange': {
      //TODO SOYD depreciation
      break;
    }
    case 'percent': // TODO DB depreciation
    case 'ytox': //TODO calc BOND PRICE
    case 'clx':
      return {
        ...state,
        registers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        cashFlowCounts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

        wasF: false,
      };
    case 'sigmaPlus': //NOOP
    case 'chs': //NOOP
    case 'recipX': // TODO Calc BOND YTM
    case 'rotateStack': // TODO clear PRGM
    case 'f': //NOOP
    case 'g':
      return {...state, wasF: false, wasG: true};
    case 'swapxy':
      return {...state, N: 0, I: 0, PMT: 0, PV: 0, FV: 0, wasF: false};
    case 'sto': //NOOP
    case 'rcl': //NOOP
    case 'N': // TODO calc AMORT
    case 'I': //TODO calc INT
    case 'PV': {
      //NPV
      let intrest = state.I / 100;
      let x = computeNPV(state, intrest);
      return {...state, wasResult: 1, hasInput: true, wasF: false, x};
    }
    case 'PMT': // TODO calc RND
    case 'FV': {
      // TODO calc IRR
      let i = computeIRR(state) * 100;

      return {...state, wasF: false, x: i, I: i, wasResult: 1, hasInput: true};
    }
    case 'runStop': //TODO P/R
    case 'EEX': // NOOP
    case 'singleStep': {
      let registers = state.registers.slice();
      registers[1] = registers[2] = registers[3] = registers[4] = registers[5] = registers[6] = 0;
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
