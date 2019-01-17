import {Action, State, StateUpdate, ResultState} from './interfaces';
import {zeroPad, spacePad, frac, intg, add, sub, mul, div, isZero, notInValueRange} from './util';
import {Decimal} from 'decimal.js';
import {ONE, HUNDRED, ZERO, TWELVE} from './constants';
import {calcApp} from './redux_actions';

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

  return sub(
    add(
      add(add(mul(new Decimal(365), yyyy), mul(new Decimal(31), sub(mm, ONE))), dd),
      intg(div(z, new Decimal(4)))
    ),
    x
  );
}

function dt(yyyy: Decimal, mm: Decimal, z: Decimal) {
  return yyyy
    .mul(360)
    .add(mm.sub(1).mul(30))
    .add(z);
}

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

function getStdDevNumerators(state: State): Decimal[] {
  const sumX2 = state.registers[3];
  const sumX = state.registers[2];
  const n = state.registers[1];
  const sxNumerator = sub(mul(n, sumX2), Decimal.pow(sumX, 2));
  const sumY2 = state.registers[5];
  const sumY = state.registers[4];
  const syNumerator = sub(mul(n, sumY2), Decimal.pow(sumY, 2));

  return [sxNumerator, syNumerator];
}

export function reduceG(state: State, action: Action): State {
  let updates = {};
  switch (action.type) {
    case 0: {
      // mean
      if (isZero(state.registers[1])) {
        return {...state, wasG: false, error: 2};
      }
      updates = {
        x: div(state.registers[2], state.registers[1]),
        y: div(state.registers[4], state.registers[1]),
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    }
    case 1: {
      // xhat, r
      const [sxNumerator, syNumerator] = getStdDevNumerators(state);
      if (isZero(syNumerator) || sxNumerator.mul(syNumerator).lessThanOrEqualTo(ZERO)) {
        return {...state, wasG: false, error: 2};
      }
      const ab = computeABr(state);
      const A = ab[0];
      const B = ab[1];
      const R = ab[2];
      updates = {
        x: div(sub(state.x, A), B),
        y: R,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        lastX: state.x,
      };
      break;
    }

    case 2: {
      // yhat, r
      const [sxNumerator, syNumerator] = getStdDevNumerators(state);
      if (isZero(sxNumerator) || sxNumerator.mul(syNumerator).lessThanOrEqualTo(ZERO)) {
        return {...state, wasG: false, error: 2};
      }
      const ab = computeABr(state);
      const A = ab[0];
      const B = ab[1];
      const R = ab[2];
      updates = {
        x: add(A, mul(B, state.x)),
        y: R,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        lastX: state.x,
      };
      break;
    }
    case 3: {
      if (!intg(state.x).equals(state.x) || state.x.lessThan(0)) {
        return {...state, error: 0, wasG: false};
      }
      // factorial
      let c = state.x.toNumber();
      let r = ONE;
      for (let i = 1; i <= c; i++) {
        r = mul(r, new Decimal(i));
      }
      updates = afterUnary({x: r, lastX: state.x});
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
    case 6: {
      // weighted mean
      if (isZero(state.registers[2])) {
        return {...state, wasG: false, error: 2};
      }
      updates = {
        x: div(state.registers[6], state.registers[2]),
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    }
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
      const n = state.registers[1];
      const [sxNumerator, syNumerator] = getStdDevNumerators(state);
      const sDenominator = mul(n, sub(n, ONE));
      const sX = Decimal.pow(div(sxNumerator, sDenominator), 0.5);
      const sY = Decimal.pow(div(syNumerator, sDenominator), 0.5);

      if (
        n.equals(ZERO) ||
        n.equals(ONE) ||
        sxNumerator.lessThan(ZERO) ||
        syNumerator.lessThan(ZERO)
      ) {
        return {...state, wasG: false, error: 2};
      }
      updates = {
        x: sX,
        y: sY,
        wasResult: ResultState.REGULAR,
      };

      break;
    }
    case 'Enter': // ALG -- nogo
    case '+': {
      // lastx
      updates = {
        hasInput: true,
        x: state.lastX,
      };
      if (state.wasResult === ResultState.REGULAR) {
        //LIFT
        updates = {...updates, t: state.z, z: state.y, y: state.x};
      }
      break;
    }
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
    case 'percentTotal': {
      // LN
      if (state.x.lessThanOrEqualTo(ZERO)) {
        return {...state, error: 0, wasG: false};
      }
      updates = afterUnary({
        x: state.x.ln(),
        lastX: state.x,
        wasResult: ResultState.REGULAR,
      });
      break;
    }
    case 'percentChange': // FRAC
      updates = afterUnary({
        x: frac(state.x),
        lastX: state.x,
        wasResult: ResultState.REGULAR,
      });
      break;
    case 'percent': // INTG
      updates = afterUnary({
        x: intg(state.x),
        lastX: state.x,
        wasResult: ResultState.REGULAR,
      });
      break;
    case 'ytox': {
      // sqrt(x)
      if (state.x.lessThan(ZERO)) {
        return {...state, error: 0, wasG: false};
      }
      updates = afterUnary({
        x: Decimal.pow(state.x, 0.5),
        wasResult: ResultState.REGULAR,
        lastX: state.x,
      });
      break;
    }
    case 'clx': {
      // x=y
      if (
        !state.programRunning ||
        state.x
          .sub(state.y)
          .abs()
          .lessThanOrEqualTo(0.00000000001)
      ) {
        return {...state, wasG: false};
      }
      return {...state, programCounter: state.programCounter + 1, wasG: false};
    }
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
        wasResult: ResultState.NOLIFT,
        hasInput: true,
        x: registers[1],
        lastX: state.x,
      };
      break;
    }
    case 'chs': {
      const [month, day, year] = getDecimalDMY(state, state.y);

      konsole.log('YDATE= month ' + month + ' day ' + day + ' year ' + year);
      const d = new Date();
      d.setUTCMonth(month.toNumber() - 1);
      d.setUTCDate(day.toNumber());
      d.setUTCFullYear(year.toNumber());
      konsole.log('-->' + d);
      d.setTime(d.getTime() + 86400000 * state.x.toNumber());
      konsole.log('--after adding ' + state.x + ' days ' + d);
      console.log(
        'date -> ' + (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + '/' + d.getUTCFullYear()
      );
      let newX;
      let displaySpecial: string;
      let dow = d.getDay() === 0 ? 7 : d.getDay();
      if (state.mDotDY) {
        newX = d.getMonth() + 1 + d.getDate() * 0.01 + d.getFullYear() * 0.000001;
        displaySpecial =
          '' +
          spacePad(d.getMonth() + 1, 2) +
          ',' +
          zeroPad(d.getDate(), 2) +
          ',' +
          d.getFullYear() +
          ' ' +
          dow;
      } else {
        newX = d.getDate() + (d.getMonth() + 1) * 0.01 + d.getFullYear() * 0.000001;
        displaySpecial =
          '' +
          +spacePad(d.getDate(), 2) +
          ',' +
          zeroPad(d.getMonth() + 1, 2) +
          ',' +
          d.getFullYear() +
          ' ' +
          dow;
      }
      updates = {
        x: new Decimal(newX),
        displaySpecial,
        hasInput: true,
        wasResult: ResultState.REGULAR,
        lastX: state.x,
      };
      break;
    }
    case 'EEX': {
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
      const stDate = new Date();
      stDate.setUTCFullYear(stYear.toNumber());
      stDate.setUTCMonth(stMonth.sub(ONE).toNumber());
      stDate.setUTCDate(stDay.toNumber());

      const enDate = new Date();
      enDate.setUTCFullYear(enYear.toNumber());
      enDate.setUTCMonth(enMonth.sub(ONE).toNumber());
      enDate.setUTCDate(enDay.toNumber());

      const diff = (enDate.getTime() - stDate.getTime()) / 86400000;
      // const end = YMDToDec(enYear, enMonth, enDay);
      // console.log('end YMD NUMBER ->' + end.toNumber());

      updates = {
        y: YMDToDec360(stYear, stMonth, stDay, enYear, enMonth, enDay),
        // x: sub(end, start),
        x: intg(new Decimal(diff).toDecimalPlaces(0)),
        hasInput: true,
        wasResult: ResultState.REGULAR,
        lastX: state.x,
      };
      break;
    }
    case 'recipX': // E^x
      updates = afterUnary({
        x: Decimal.exp(state.x),
        lastX: state.x,
      });
      break;
    case 'rotateStack': {
      //GTO
      if (state.programRunning) {
        console.log('something went wrong, we hit g/gto in program running mode');
        return {...state, wasG: false, error: 9};
      }
      return {...state, wasG: false, wasGto: true};
    }
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
    case 'swapxy': {
      // x<=y
      console.log('x<=y x is ' + state.x.toNumber() + ' y is ' + state.y.toNumber());
      console.log(
        'running? ' + state.programRunning + ' less than ' + state.x.lessThanOrEqualTo(state.y)
      );
      if (!state.programRunning || state.x.lessThanOrEqualTo(state.y)) {
        console.log('continuing');
        return {...state, wasG: false};
      }
      console.log('skipping next');
      return {...state, programCounter: state.programCounter + 1, wasG: false};
    }
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
      const newN = mul(TWELVE, state.x);
      if (notInValueRange(newN)) {
        return {...state, wasG: false, error: 1};
      }
      updates = {
        N: mul(TWELVE, state.x),
        x: mul(TWELVE, state.x),
        hasInput: false,
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
        x: div(state.x, new Decimal(12)),
        hasInput: false,
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
        if (state.N.greaterThanOrEqualTo(20)) {
          return {...state, error: 6};
        }
        updates = {
          x: state.registers[state.N.toNumber()],
          wasResult: ResultState.REGULAR,
          hasInput: true,
          N: sub(state.N, ONE),
          wasRcl: false,
        };
        break;
      }
      if (state.N.greaterThanOrEqualTo(19)) {
        return {...state, error: 6};
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
      if (state.x.greaterThan(99) || state.x.lessThan(ZERO) || !intg(state.x).equals(state.x)) {
        return {...state, error: 6};
      }
      // Nj
      if (state.N.greaterThanOrEqualTo(20)) {
        return {...state, error: 6};
      }
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

    case 'runStop': {
      // PSE
      return {...state, displaySpecial: null, wasG: false};
    }
    case 'singleStep': // TODO BST
    default:
      return state;
  }
  return {...state, ...updates, wasG: false};
}

export function reduceGGto(state: State, action: Action): State {
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
      let curGto = state.gtoScratch.slice();
      curGto.push(action.type);
      let counter = curGto[0] * 10 + curGto[1];
      if (curGto.length !== 2) {
        return {...state, gtoScratch: curGto};
      }
      return {...state, programCounter: counter, gtoScratch: [], wasGto: false};
    }
    case '.':
      return state;
    default:
      return calcApp({...state, wasGto: false}, action);
  }
}
