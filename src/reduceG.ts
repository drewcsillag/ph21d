import {State, StateUpdate, Action} from 'interfaces';
import {intg, frac} from './util';

const konsole = console;

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

function afterUnary(updates: StateUpdate): StateUpdate {
  return {...updates, wasResult: 1, hasInput: true};
}

export function reduceG(state: State, action: Action) {
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
