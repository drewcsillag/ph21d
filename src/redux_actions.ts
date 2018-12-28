/// ./node_modules/.bin/webpack-serve --content ./dist --open

import {createStore} from 'redux';
import {State, StateUpdate, Action} from 'interfaces';
// Fractional N doesn't work for financial functions (amortization)

// to placate tslint
const konsole = console;

const initialState: State = {
  mDotDY: true,
  wasG: false,
  wasF: false,
  hasInput: false,
  wasResult: 0,
  wasSto: false,
  wasRcl: false,
  begEnd: 0,

  dec: 0,

  N: 0,
  PV: 0,
  PMT: 0,
  I: 0,
  FV: 0,
  x: 0,
  y: 0,
  stack3: 0,
  stack4: 0,
  registers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  cashFlowCounts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

function afterUnary(updates: StateUpdate): StateUpdate {
  return {...updates, wasResult: 1, hasInput: true};
}

function computeABr(state: State) {
  let sy = state.registers[4];
  let sy2 = state.registers[5];
  let n = state.registers[1];
  let sx = state.registers[2];
  let sxy = state.registers[6];
  let sx2 = state.registers[3];
  let Bnum = sxy - (sx * sy) / n;
  let Bden = sx2 - (sx * sx) / n;
  let B = Bnum / Bden;
  let A = sy / n - B * (sx / n);

  let Rnum = sxy - (sx * sy) / n;
  let Rden1 = sx2 - (sx * sx) / n;
  let Rden2 = sy2 - (sy * sy) / n;
  let R = Rnum / (Rden1 * Rden2) ** 0.5;
  return [A, B, R];
}

function getDecimalDMY(state: State, n: number) {
  let month = state.mDotDY ? intg(n) : intg(frac(n) * 100);
  let day = state.mDotDY ? intg(frac(n) * 100) : intg(n);
  let year = intg(frac(n * 100) * 10000 + 0.0000005);
  return [month, day, year];
}

function YMDToDec(yyyy: number, mm: number, dd: number) {
  // have to check on leap days around centuries/400's
  let x;
  let z;
  if (mm <= 2) {
    x = 0;
    z = yyyy - 1;
  } else {
    x = intg(0.4 * mm + 2.3);
    z = yyyy;
  }
  return 365 * yyyy + 31 * (mm - 1) + dd + intg(z / 4) - x;
}

// this doesn't 100% match the calculator output, but it's close
function YMDToDec360(
  yyyy1: number,
  mm1: number,
  dd1: number,
  yyyy2: number,
  mm2: number,
  dd2: number
) {
  let z1;
  if (dd1 === 31) {
    z1 = 30;
  } else {
    z1 = dd1;
  }
  let fDT1 = 360 * yyyy1 + 30 * mm1 + z1;

  let z2;
  if (dd2 === 31 && (dd1 === 30 || dd1 === 31)) {
    z2 = 30;
  } else if (dd2 === 31 && dd1 < 30) {
    z2 = dd2;
  } else {
    z2 = dd2;
  }

  let fDT2 = 360 * yyyy2 + 30 * mm2 + z2;
  return fDT2 - fDT1;
}

function reduceG(state: State, action: Action) {
  let updates = {};
  switch (action.type) {
    case 0: //mean
      updates = {
        x: state.registers[2] / state.registers[1],
        y: state.registers[4] / state.registers[1],
        wasResult: 1,
        hasInput: true,
      };
      break;

    case 1: {
      //xhat, r
      let ab = computeABr(state);
      let A = ab[0];
      let B = ab[1];
      let R = ab[2];
      updates = {
        x: (state.x - A) / B,
        y: R,
        wasResult: 1,
        hasInput: true,
      };
      break;
    }

    case 2: {
      //yhat, r
      let ab = computeABr(state);
      let A = ab[0];
      let B = ab[1];
      let R = ab[2];
      updates = {
        x: A + B * state.x,
        y: R,
        wasResult: 1,
        hasInput: true,
      };
      break;
    }
    case 3: {
      //factorial
      let x = state.x;
      let c = x;
      while (c > 1) {
        c -= 1;
        x *= c;
      }
      updates = afterUnary({x});
      break;
    }
    case 4: //d.my
      updates = {
        mDotDY: false,
      };
      break;
    case 5: //m.dy
      updates = {
        mDotDY: true,
      };
      break;
    case 6:
      updates = {
        x: state.registers[6] / state.registers[2],
        wasResult: 1,
        hasInput: true,
      };
      break;
    case 7:
      updates = {
        begEnd: 1,
      };
      break;
    case 8:
      updates = {
        begEnd: 0,
      };
      break;
    case 9: //mem TODO
    case '.': {
      // std dev
      let sumX2 = state.registers[3];
      let sumX = state.registers[2];
      let n = state.registers[1];
      let sxNumerator = n * sumX2 - sumX ** 2;
      let sDenominator = n * (n - 1);
      let sX = Math.sqrt(sxNumerator / sDenominator);

      let sumY2 = state.registers[5];
      let sumY = state.registers[4];
      let syNumerator = n * sumY2 - sumY ** 2;
      let sY = Math.sqrt(syNumerator / sDenominator);

      updates = {
        x: sX,
        y: sY,
      };

      break;
    }
    case 'Enter': // ALG -- nogo
    case '+': // TODO lastx
    case '-': // backsapce -- nogo? TODO
    case 'times': //X^2
      updates = {
        x: state.x * state.x,
        wasResult: 1,
        hasInput: true,
      };
      break;
    case 'div': //TODO curved back arrow
    case 'percentTotal': // LN
      updates = afterUnary({
        x: Math.log(state.x),
      });
      break;
    case 'percentChange': //FRAC
      updates = afterUnary({
        x: frac(state.x),
      });
      break;
    case 'percent': //INTG
      updates = afterUnary({
        x: intg(state.x),
      });
      break;
    case 'ytox': //sqrt(x)
      updates = afterUnary({
        x: state.x ** 0.5,
      });
      break;
    case 'clx':
      updates = {
        wasG: false,
        wasF: false,
      };
      break;
    case 'sigmaPlus': {
      // sigma-
      let registers = state.registers.slice();
      registers[1] -= 1;
      registers[2] -= state.x;
      registers[3] -= state.x * state.x;
      registers[4] -= state.y;
      registers[5] -= state.y * state.y;
      registers[6] -= state.x * state.y;
      updates = {
        registers,
        wasResult: 2,
        hasInput: true,
      };
      break;
    }
    case 'chs': {
      let [month, day, year] = getDecimalDMY(state, state.y);

      konsole.log('YDATE= month ' + month + ' day ' + day + ' year ' + year);
      let d = new Date(year, month - 1, day);
      konsole.log('-->' + d);
      d.setDate(d.getDate() + state.x);
      konsole.log('--after adding ' + state.x + ' days ' + d);
      let newX;
      if (state.mDotDY) {
        let newMonth = d.getMonth() + 1;
        let newDay = d.getDay() * 0.01;
        let newYear = d.getFullYear() * 0.000001;
        konsole.log('m ' + newMonth + ' d ' + newDay + ' y ' + newYear);
        newX = d.getMonth() + 1 + d.getDay() * 0.01 + d.getFullYear() * 0.000001;
      } else {
        newX = d.getDay() + (d.getMonth() + 1) * 0.01 + d.getFullYear() * 0.000001;
      }
      updates = {
        x: newX,
        hasInput: true,
        wasResult: 1,
      };
      break;
    }
    case 'EEX': {
      //TODO doesn't deal with 360 day year stuff (which should go into y)
      let [stMonth, stDay, stYear] = getDecimalDMY(state, state.y);
      let start = YMDToDec(stYear, stMonth, stDay);

      let [enMonth, enDay, enYear] = getDecimalDMY(state, state.x);
      let end = YMDToDec(enYear, enMonth, enDay);

      updates = {
        y: YMDToDec360(enYear, enMonth, enDay, stYear, stMonth, stDay),
        x: start - end,
        hasInput: true,
        wasResult: 1,
      };
      break;
    }
    case 'recipX': //E^x
      updates = afterUnary({
        x: Math.exp(state.x),
      });
      break;
    case 'rotateStack': //TODO GTO
    case 'f':
      {
        updates = {
          wasF: true,
        };
      }
      break;
    case 'g':
      updates = {
        wasG: true,
      };
      break;
    case 'swapxy': //TODO X<=y
    case 'sto': //TODO unset G, reduce normally
    case 'rcl': //TODO unset G, reduce normally
    case 'N':
      updates = {
        N: 12 * state.x,
        hasInput: true,
        wasResult: 1,
      };
      break;
    case 'I':
      updates = {
        I: state.x / 12,
        hasInput: true,
        wasResult: 1,
      };
      break;
    case 'PV': {
      //CF0
      const cashFlowCounts = state.cashFlowCounts.slice();
      cashFlowCounts[0] = 1;
      const registers = state.registers.slice();
      registers[0] = state.x;
      konsole.log('flow number will be ' + 0);
      updates = {
        registers,
        wasResult: 1,
        hasInput: true,
        N: 0,
        cashFlows: [{amount: state.x, count: 1, flowNumber: 0}],
      };
      break;
    }
    case 'PMT': {
      //CFj
      if (state.wasRcl) {
        updates = {
          x: state.registers[state.N],
          wasResult: 1,
          hasInput: true,
          N: state.N - 1,
          wasRcl: false,
        };
        break;
      }
      const registers = state.registers.slice();
      registers[state.N + 1] = state.x;
      const cashFlowCounts = state.cashFlowCounts.slice();
      cashFlowCounts[state.N + 1] = 1;
      updates = {
        registers,
        cashFlowCounts,
        N: state.N + 1,
        hasInput: true,
        wasResult: 1,
      };
      break;
    }
    case 'FV': {
      //Nj
      if (state.wasRcl) {
        updates = {
          x: state.cashFlowCounts[state.N],
          wasResult: 1,
          hasInput: true,
          wasRcl: false,
        };
        break;
      }

      const cashFlowCounts = state.cashFlowCounts.slice();
      cashFlowCounts[state.N] = state.x;
      updates = {
        cashFlowCounts: cashFlowCounts,
        hasInput: true,
        wasResult: 1,
      };
      break;
    }

    case 'runStop': //TODO PSE
    case 'singleStep': //TODO BST
    default:
      return state;
  }
  return {...state, ...updates, wasG: false};
}

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

function reduceF(state: State, action: Action) {
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

function reduceSto(state: State, action: Action) {
  let updates: StateUpdate;
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4: {
      let registers = state.registers.slice();
      let registerNo: number = action.type;
      let newRegValue = state.x;
      if (state.stoOp !== null) {
        if (state.stoOp === '+') {
          newRegValue = registers[action.type] + state.x;
        } else if (state.stoOp === '-') {
          newRegValue = registers[action.type] - state.x;
        } else if (state.stoOp === 'times') {
          newRegValue = registers[action.type] * state.x;
        } else if (state.stoOp === 'div') {
          newRegValue = registers[action.type] / state.x;
        } else if (state.stoOp === '.') {
          registerNo = 10 + action.type;
        }
      }
      registers[registerNo] = newRegValue;
      updates = {
        registers,
        stoOp: null,
      };
      break;
    }
    case 5:
    case 6:
    case 7:
    case 8:
    case 9: {
      let registerNo: number = action.type;
      let registers = state.registers.slice();
      if (state.stoOp === '.') {
        registerNo = 10 + action.type;
      }
      registers[registerNo] = state.x;
      updates = {
        registers,
      };
      break;
    }
    case 'N':
      updates = {
        N: state.x,
      };
      break;
    case 'I':
      updates = {
        I: state.x,
      };
      break;
    case 'PMT':
      updates = {
        PMT: state.x,
      };
      break;
    case 'FV':
      updates = {
        FV: state.x,
      };
      break;
    case 'PV':
      updates = {
        PV: state.x,
      };
      break;
    case 'times':
      return {...state, wasSto: true, stoOp: 'times'};
    case 'div':
      return {...state, wasSto: true, stoOp: 'div'};
    case '+':
      return {...state, wasSto: true, stoOp: '+'};
    case '-':
      return {...state, wasSto: true, stoOp: '-'};
    case '.':
      return {...state, wasSto: true, stoOp: '.'};
    default:
    //FIXME error
  }
  if (updates) {
    updates = {...updates, wasSto: false, wasResult: 1};
    konsole.log(updates);
    return {...state, ...updates};
  }
}

function reduceRcl(state: State, action: Action) {
  let x = 0;
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
      if (state.stoOp === '.') {
        x = state.registers[10 + action.type];
      } else {
        x = state.registers[action.type];
      }
      break;
    case 'N':
      x = state.N;
      break;
    case 'I':
      x = state.I;
      break;
    case 'PMT':
      x = state.PMT;
      break;
    case 'FV':
      x = state.FV;
      break;
    case 'PV':
      x = state.PV;
      break;
    case '.':
      return {...state, stoOp: '.'};
    case 'g': {
      return {...state, wasG: true};
    }
    default:
    ///error;
  }
  return {...state, x, wasRcl: false, wasResult: 1, hasInput: true};
}

function calcApp(state = initialState, action: Action) {
  if (state.wasG) {
    return reduceG(state, action);
  }
  if (state.wasF) {
    return reduceF(state, action);
  }
  if (state.wasSto) {
    return reduceSto(state, action);
  }
  if (state.wasRcl) {
    return reduceRcl(state, action);
  }
  return reduceRegular(state, action);
}

function reduceRegular(state: State, action: Action) {
  // TODO fixme any
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
      return {...state, stack4: state.stack3, stack3: state.y, y: state.x, wasResult: 1};
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
      return {...state, hasInput: false, x: 0, dec: 0};
    case 'sigmaPlus': {
      let registers = state.registers.slice();
      registers[1] += 1;
      registers[2] += state.x;
      registers[3] += state.x * state.x;
      registers[4] += state.y;
      registers[5] += state.y * state.y;
      registers[6] += state.x * state.y;
      return {...state, registers, wasResult: 2, hasInput: true};
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
        return {...state, N: state.x, hasInput: false, wasResult: 1};
      } else {
        let p = computeN(state);
        return {...state, N: p, x: p, hasInput: false, wasResult: 1};
      }
    case 'I':
      if (state.hasInput) {
        return {...state, I: state.x, hasInput: false, wasResult: 1};
      } else {
        let p = computeI(state);
        return {...state, I: p, x: p, hasInput: false, wasResult: 1};
      }
    case 'PV':
      if (state.hasInput) {
        return {...state, PV: state.x, hasInput: false, wasResult: 1};
      } else {
        let p = computePV(state);
        return {...state, PV: p, x: p, hasInput: false, wasResult: 1};
      }
    case 'PMT':
      if (state.hasInput) {
        return {...state, PMT: state.x, hasInput: false, wasResult: 1};
      } else {
        let p = computePMT(state);
        return {...state, PMT: p, x: p, hasInput: false, wasResult: 1};
      }
    case 'FV':
      if (state.hasInput) {
        return {...state, FV: state.x, hasInput: false, wasResult: 1};
      } else {
        let p = computeFV(state);
        return {...state, FV: p, x: p, hasInput: false, wasResult: 1};
      }
    case 'runStop': //TODO
    case 'EEX': //TODO
    case 'singleStep': //TODO
    default:
      return state;
  }
}
function frac(n: number) {
  let wasneg = 1;
  if (n < 0) {
    wasneg = -1;
  }

  return wasneg * (n * wasneg - Math.floor(n * wasneg));
}
function intg(n: number) {
  let wasneg = 1;
  if (n < 0) {
    wasneg = -1;
  }
  return Math.floor(n * wasneg) * wasneg;
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
  // let firstHalf = PV * (1 + i) ** frac(n);
  let fracExp = (1 + i) ** frac(n);
  let firstHalf = PV * fracExp;
  let secondHalf = (1 + i * begEnd) * PMT;
  let bigI = (1 - (1 + i) ** -intg(n)) / i;
  let lastPart = FV * (1 + i) ** -intg(n);

  return firstHalf + secondHalf * bigI + lastPart;
}

function computeN(state: State) {
  let low = 0;
  let high = 99 * 12;

  let i = state.I / 100;
  let n = (low + high) / 2; // will iterate to find this
  let lastRes = 0;
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
  let lastRes = 0;
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
  let i = state.I / 100;
  let p1 = state.PV * (1 + i) ** frac(state.N);
  let f1 = state.FV * (1 + i) ** -intg(state.N);
  let bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  let b1 = 1 + i * state.begEnd;

  return -((p1 + f1) / (b1 * bigI));
}
function computePV(state: State) {
  let i = state.I / 100;
  let f1 = state.FV * (1 + i) ** -intg(state.N);
  let bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  let b1 = 1 + i * state.begEnd;
  return -((f1 + b1 * state.PMT * bigI) / (1 + i) ** frac(state.N));
}
function computeFV(state: State) {
  let i = state.I / 100;
  let p1 = state.PV * (1 + i) ** frac(state.N);

  let bigI = (1 - (1 + i) ** -intg(state.N)) / i;
  let b1 = 1 + i * state.begEnd;

  return -((p1 + b1 * state.PMT * bigI) / (1 + i) ** -intg(state.N));
}
function reduceBinaryOp(state: State, newX: number) {
  return {...state, y: state.stack3, stack3: state.stack4, x: newX, hasInput: true, wasResult: 1};
}

function reduceNumber(state: State, n: number) {
  let hasInput = 1;
  let y = state.y;
  let x = state.x;
  let wasResult = state.wasResult;
  let dec = state.dec;

  if (wasResult) {
    if (wasResult === 1) {
      y = x;
    }
    wasResult = 0;
    dec = 0;
    x = 0;
  }

  if (dec === 0) {
    x = x * 10 + n;
  } else {
    dec /= 10;
    x += dec * n;
  }
  const updates = {
    x,
    y,
    dec,
    hasInput,
    wasResult,
  };
  return {...state, ...updates};
}
export const store = createStore(calcApp);

export function button0() {
  store.dispatch({type: 0});
}
export function button1() {
  store.dispatch({type: 1});
}
export function button2() {
  store.dispatch({type: 2});
}
export function button3() {
  store.dispatch({type: 3});
}
export function button4() {
  store.dispatch({type: 4});
}
export function button5() {
  store.dispatch({type: 5});
}
export function button6() {
  store.dispatch({type: 6});
}
export function button7() {
  store.dispatch({type: 7});
}
export function button8() {
  store.dispatch({type: 8});
}
export function button9() {
  store.dispatch({type: 9});
}
export function buttonPoint() {
  store.dispatch({type: '.'});
}
export function buttonPlus() {
  store.dispatch({type: '+'});
}
export function buttonEnter() {
  store.dispatch({type: 'Enter'});
}
export function buttonMinus() {
  store.dispatch({type: '-'});
}
export function buttonTimes() {
  store.dispatch({type: 'times'});
}
export function buttonDiv() {
  store.dispatch({type: 'div'});
}
export function buttonPercentTotal() {
  store.dispatch({type: 'percentTotal'});
}
export function buttonPercentChange() {
  store.dispatch({type: 'percentChange'});
}
export function buttonPercent() {
  store.dispatch({type: 'percent'});
}
export function buttonYtoX() {
  store.dispatch({type: 'ytox'});
}
export function buttonCLx() {
  store.dispatch({type: 'clx'});
}
export function buttonSigmaPlus() {
  store.dispatch({type: 'sigmaPlus'});
}
export function buttonCHS() {
  store.dispatch({type: 'chs'});
}
export function buttonRecipX() {
  store.dispatch({type: 'recipX'});
}
export function buttonRotateStack() {
  store.dispatch({type: 'rotateStack'});
}
export function buttonF() {
  store.dispatch({type: 'f'});
}
export function buttonG() {
  store.dispatch({type: 'g'});
}
export function buttonSwapXY() {
  store.dispatch({type: 'swapxy'});
}
export function buttonSTO() {
  store.dispatch({type: 'sto'});
}
export function buttonRCL() {
  store.dispatch({type: 'rcl'});
}
export function buttonN() {
  store.dispatch({type: 'N'});
}
export function buttonI() {
  store.dispatch({type: 'I'});
}
export function buttonPV() {
  store.dispatch({type: 'PV'});
}
export function buttonPMT() {
  store.dispatch({type: 'PMT'});
}
export function buttonFV() {
  store.dispatch({type: 'FV'});
}
export function buttonRunStop() {
  store.dispatch({type: 'runStop'});
}
export function buttonSingleStep() {
  store.dispatch({type: 'singleStep'});
}
export function buttonEEX() {
  store.dispatch({type: 'EEX'});
}
