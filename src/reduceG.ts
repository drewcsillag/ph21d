import {Action, State, StateUpdate, ResultState} from './interfaces';
import {frac, intg, add, sub, mul, div} from './util';
import {Decimal} from 'decimal.js';
import {ONE, HUNDRED, ZERO, TWELVE} from './constants';

const konsole = console;

function computeABr(state: State) {
  const sy = state.registers[4];
  const sy2 = state.registers[5];
  const n = state.registers[1];
  const sx = state.registers[2];
  const sxy = state.registers[6];
  const sx2 = state.registers[3];

  const Bnum = sub(sxy, div(mul(sx, sy), n));
  // const Bnum = sxy - (sx * sy) / n;
  const Bden = sub(sx2, div(mul(sx, sx), n));
  // const Bden = sx2 - (sx * sx) / n;
  const B = div(Bnum, Bden);
  // const B = Bnum / Bden;
  const A = sub(div(sy, n), mul(B, div(sx, n)));
  // const A = sy / n - B * (sx / n);

  const Rnum = sub(sxy, div(mul(sx, sy), n));
  // const Rnum = sxy - (sx * sy) / n;
  const Rden1 = sub(sx2, div(mul(sx, sx), n));
  // const Rden1 = sx2 - (sx * sx) / n;
  const Rden2 = sub(sy2, div(mul(sy, sy), n));
  // const Rden2 = sy2 - (sy * sy) / n;
  const R = div(Rnum, Decimal.pow(mul(Rden1, Rden2), 0.5));
  // const R = Rnum / (Rden1 * Rden2) ** 0.5;
  return [A, B, R];
}

function getDecimalDMY(state: State, n: Decimal): Decimal[] {
  const month = state.mDotDY ? intg(n) : intg(mul(HUNDRED, frac(n)));
  const day = state.mDotDY ? intg(mul(frac(n), HUNDRED)) : intg(n);

  const yearRounded = add(n, new Decimal('0.0000005'));
  const year = intg(mul(new Decimal(10000), frac(mul(yearRounded, HUNDRED))));
  // const year = intg(frac(n * 100) * 10000 + 0.0000005);
  return [month, day, year];
}

function YMDToDec(yyyy: Decimal, mm: Decimal, dd: Decimal) {
  // have to check on leap days around centuries/400's
  let x;
  let z;
  if (mm.lessThanOrEqualTo(2)) {
    x = ZERO;
    z = sub(yyyy, ONE);
  } else {
    x = intg(add(mul(new Decimal(0.4), mm), new Decimal(2.3)));
    z = yyyy;
  }

  // return sub(
  //   add(
  //     add(
  //       add(
  //         mul(
  //           new Decimal(365),
  //           yyyy),
  //         mul(
  //           new Decimal(31),
  //           sub(mm, 1))
  //         ),
  //       dd
  //       ),
  //     intg(div(z, new Decimal(4))), x);

  return sub(
    add(
      add(add(mul(new Decimal(365), yyyy), mul(new Decimal(31), sub(mm, ONE))), dd),
      intg(div(z, new Decimal(4)))
    ),
    x
  );

  // return 365 * yyyy + 31 * (mm - 1) + dd + intg(z / 4) - x;
}

function dt(yyyy: Decimal, mm: Decimal, z: Decimal) {
  // console.log('yyyy * 360: ', yyyy.mul(360).toNumber());
  // console.log(
  //   '(mm-1) * 30: ',
  //   mm
  //     .sub(1)
  //     .mul(30)
  //     .toNumber()
  // );
  // console.log('z: ' + z.toNumber());
  const result = yyyy
    .mul(360)
    .add(mm.sub(1).mul(30))
    .add(z);
  // console.log('sum: ' + result);
  return result;
}

// this doesn't 100% match the calculator output, but it's close
function YMDToDec360(
  yyyy1: Decimal,
  mm1: Decimal,
  dd1: Decimal,
  yyyy2: Decimal,
  mm2: Decimal,
  dd2: Decimal
) {
  let z1: Decimal;
  if (dd1.equals(31)) {
    z1 = new Decimal(30);
  } else {
    z1 = dd1;
  }
  const fDT1 = dt(yyyy1, mm1, z1);

  let z2: Decimal;
  if (dd2.toNumber() === 31 && (dd1.equals(30) || dd1.equals(31))) {
    z2 = new Decimal(30);
  } else if (dd2.equals(31) && dd1.lessThan(30)) {
    z2 = dd2;
  } else {
    z2 = dd2;
  }

  const fDT2 = dt(yyyy2, mm2, z2);
  return fDT2.sub(fDT1);
}

function afterUnary(updates: StateUpdate): StateUpdate {
  return {...updates, wasResult: ResultState.REGULAR, hasInput: true};
}

export function reduceG(state: State, action: Action) {
  let updates = {};
  switch (action.type) {
    case 0: // mean
      updates = {
        x: div(state.registers[2], state.registers[1]),
        y: div(state.registers[4], state.registers[1]),
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;

    case 1: {
      // xhat, r
      const ab = computeABr(state);
      const A = ab[0];
      const B = ab[1];
      const R = ab[2];
      updates = {
        x: div(sub(state.x, A), B),
        y: R,
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    }

    case 2: {
      // yhat, r
      const ab = computeABr(state);
      const A = ab[0];
      const B = ab[1];
      const R = ab[2];
      updates = {
        x: add(A, mul(B, state.x)),
        y: R,
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    }
    case 3: {
      // factorial
      let c = state.x.toNumber();
      let r = ONE;
      for (let i = 1; i <= c; i++) {
        r = mul(r, new Decimal(i));
      }
      updates = afterUnary({x: r});
      break;
    }
    case 4: // d.my
      updates = {
        mDotDY: false,
      };
      break;
    case 5: // m.dy
      updates = {
        mDotDY: true,
      };
      break;
    case 6:
      updates = {
        x: div(state.registers[6], state.registers[2]),
        wasResult: ResultState.REGULAR,
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
    case 9: // mem TODO
    case '.': {
      // std dev
      const sumX2 = state.registers[3];
      const sumX = state.registers[2];
      const n = state.registers[1];
      const sxNumerator = sub(mul(n, sumX2), Decimal.pow(sumX, 2));
      const sDenominator = mul(n, sub(n, ONE));
      const sX = Decimal.pow(div(sxNumerator, sDenominator), 0.5);

      const sumY2 = state.registers[5];
      const sumY = state.registers[4];
      const syNumerator = sub(mul(n, sumY2), Decimal.pow(sumY, 2));
      const sY = Decimal.pow(div(syNumerator, sDenominator), 0.5);

      updates = {
        x: sX,
        y: sY,
        wasResult: ResultState.REGULAR,
      };

      break;
    }
    case 'Enter': // ALG -- nogo
    case '+': // TODO lastx
      updates = {
        hasInput: true,
        x: state.lastX,
      };
      break;
    case '-':
      // backspace: true triggers the top level to back up
      return {...state, backspace: true};
    case 'times': // X^2
      updates = {
        x: mul(state.x, state.x),
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    case 'div': // TODO curved back arrow
    case 'percentTotal': // LN
      updates = afterUnary({
        x: state.x.ln(),
        wasResult: ResultState.REGULAR,
      });
      break;
    case 'percentChange': // FRAC
      updates = afterUnary({
        x: frac(state.x),
        wasResult: ResultState.REGULAR,
      });
      break;
    case 'percent': // INTG
      updates = afterUnary({
        x: intg(state.x),
        wasResult: ResultState.REGULAR,
      });
      break;
    case 'ytox': // sqrt(x)
      updates = afterUnary({
        x: Decimal.pow(state.x, 0.5),
        wasResult: ResultState.REGULAR,
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
      const registers = state.registers.slice();
      registers[1] = sub(registers[1], ONE);
      registers[2] = sub(registers[2], state.x);
      registers[3] = sub(registers[3], mul(state.x, state.x));
      registers[4] = sub(registers[4], state.y);
      registers[5] = sub(registers[5], mul(state.y, state.y));
      registers[6] = sub(registers[6], mul(state.x, state.y));
      updates = {
        registers,
        wasResult: ResultState.STATISTICS,
        hasInput: true,
        x: registers[1],
      };
      break;
    }
    case 'chs': {
      const [month, day, year] = getDecimalDMY(state, state.y);

      konsole.log('YDATE= month ' + month + ' day ' + day + ' year ' + year);
      const d = new Date(year.toNumber(), month.toNumber() - 1, day.toNumber());
      konsole.log('-->' + d);
      d.setDate(d.getDate() + state.x.toNumber());
      konsole.log('--after adding ' + state.x + ' days ' + d);
      let newX;
      if (state.mDotDY) {
        const newMonth = d.getMonth() + 1;
        const newDay = d.getDay() * 0.01;
        const newYear = d.getFullYear() * 0.000001;
        konsole.log('m ' + newMonth + ' d ' + newDay + ' y ' + newYear);
        newX = d.getMonth() + 1 + d.getDay() * 0.01 + d.getFullYear() * 0.000001;
      } else {
        newX = d.getDay() + (d.getMonth() + 1) * 0.01 + d.getFullYear() * 0.000001;
      }
      updates = {
        x: newX,
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
      break;
    }
    case 'EEX': {
      // TODO doesn't deal with 360 day year stuff right
      const [stMonth, stDay, stYear] = getDecimalDMY(state, state.y);
      konsole.log(
        'START DATE: ' + stMonth.toNumber() + '/' + stDay.toNumber() + '/' + stYear.toNumber()
      );
      const start = YMDToDec(stYear, stMonth, stDay);
      console.log('start YMD NUMBER ->' + start.toNumber());

      const [enMonth, enDay, enYear] = getDecimalDMY(state, state.x);
      konsole.log(
        'START DATE: ' + enMonth.toNumber() + '/' + enDay.toNumber() + '/' + enYear.toNumber()
      );
      const end = YMDToDec(enYear, enMonth, enDay);
      console.log('end YMD NUMBER ->' + end.toNumber());

      updates = {
        y: YMDToDec360(stYear, stMonth, stDay, enYear, enMonth, enDay),
        x: sub(end, start),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
      break;
    }
    case 'recipX': // E^x
      updates = afterUnary({
        x: Decimal.exp(state.x),
      });
      break;
    case 'rotateStack': // TODO GTO
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
    case 'swapxy': // TODO X<=y
    case 'sto': // TODO unset G, reduce normally
    case 'rcl': // TODO unset G, reduce normally
    case 'N': {
      if (state.wasRcl) {
        updates = {
          wasRcl: false,
          hasInput: true,
          x: state.N.div(TWELVE),
        };
        break;
      }
      updates = {
        N: mul(TWELVE, state.x),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
      break;
    }
    case 'I': {
      if (state.wasRcl) {
        updates = {
          wasRcl: false,
          hasInput: true,
          x: state.I.mul(TWELVE),
        };
        break;
      }
      updates = {
        I: div(state.x, new Decimal(12)),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
      break;
    }
    case 'PV': {
      // CF0
      const cashFlowCounts = state.cashFlowCounts.slice();
      cashFlowCounts[0] = ONE;
      const registers = state.registers.slice();
      registers[0] = state.x;
      konsole.log('flow number will be ' + 0);
      updates = {
        registers,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        N: ZERO,
        cashFlows: [{amount: state.x, count: 1, flowNumber: 0}],
      };
      break;
    }
    case 'PMT': {
      // CFj
      if (state.wasRcl) {
        updates = {
          x: state.registers[state.N.toNumber()],
          wasResult: ResultState.REGULAR,
          hasInput: true,
          N: sub(state.N, ONE),
          wasRcl: false,
        };
        break;
      }
      const registers = state.registers.slice();
      registers[state.N.toNumber() + 1] = state.x;
      const cashFlowCounts = state.cashFlowCounts.slice();
      cashFlowCounts[state.N.toNumber() + 1] = ONE;
      updates = {
        registers,
        cashFlowCounts,
        N: add(state.N, ONE),
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
      break;
    }
    case 'FV': {
      // Nj
      if (state.wasRcl) {
        updates = {
          x: state.cashFlowCounts[state.N.toNumber()],
          wasResult: ResultState.REGULAR,
          hasInput: true,
          wasRcl: false,
        };
        break;
      }

      const cashFlowCounts = state.cashFlowCounts.slice();
      cashFlowCounts[state.N.toNumber()] = state.x;
      updates = {
        cashFlowCounts,
        hasInput: true,
        wasResult: ResultState.REGULAR,
      };
      break;
    }

    case 'runStop': // TODO PSE
    case 'singleStep': // TODO BST
    default:
      return state;
  }
  return {...state, ...updates, wasG: false};
}
