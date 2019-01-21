import {Decimal} from 'decimal.js';
import {ONE, TWELVE, TWENTY, ZERO} from './constants';
import {dateDiff, dateDiff360, getDecimalDMY, plusDays, validateDate} from './dates';
import {
  Action,
  makeRegisterBundle,
  ResultState,
  State,
  StateUpdate,
  StatsRegisterBundle,
} from './interfaces';
import {calcApp} from './redux_actions';
import {
  computeXHat,
  computeYHat,
  getStdDevNumerators,
  mean,
  stdDev,
  subPoint,
  weightedMean,
} from './stats';
import {add, div, frac, intg, isZero, mul, notInValueRange, spacePad, sub, zeroPad} from './util';

function afterUnary(updates: StateUpdate): StateUpdate {
  return {...updates, wasResult: ResultState.REGULAR, hasInput: true};
}

export function reduceG(state: State, action: Action): State {
  let updates: StateUpdate = {};
  switch (action.type) {
    case 0: {
      // mean
      if (isZero(state.registers[1])) {
        return {...state, wasG: false, error: 2};
      }
      const [x, y] = mean(makeRegisterBundle(state));
      updates = {
        x,
        y,
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    }
    case 1: {
      // xhat, r
      const bundle = makeRegisterBundle(state);
      const [sxNumerator, syNumerator] = getStdDevNumerators(bundle);
      if (isZero(syNumerator) || sxNumerator.mul(syNumerator).lessThanOrEqualTo(ZERO)) {
        return {...state, wasG: false, error: 2};
      }
      const [xhat, R] = computeXHat(bundle, state.x);
      updates = {
        x: xhat,
        y: R,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        lastX: state.x,
      };
      break;
    }

    case 2: {
      // yhat, r
      const bundle = makeRegisterBundle(state);
      const [sxNumerator, syNumerator] = getStdDevNumerators(bundle);
      if (isZero(sxNumerator) || sxNumerator.mul(syNumerator).lessThanOrEqualTo(ZERO)) {
        return {...state, wasG: false, error: 2};
      }
      const [yhat, R] = computeYHat(bundle, state.x);
      updates = {
        x: yhat,
        y: R,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        lastX: state.x,
      };
      break;
    }
    case 3: {
      if (!intg(state.x).equals(state.x) || state.x.lessThan(ZERO)) {
        return {...state, error: 0, wasG: false};
      }
      // factorial
      const c = state.x.toNumber();
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
        x: weightedMean(makeRegisterBundle(state)),
        wasResult: ResultState.REGULAR,
        hasInput: true,
      };
      break;
    }
    case 7:
      updates = {
        begEnd: new Decimal(1),
      };
      break;
    case 8:
      updates = {
        begEnd: new Decimal(0),
      };
      break;
    case 9: // mem TODO
    case '.': {
      // std dev
      const bundle = makeRegisterBundle(state);
      const n = state.registers[1];
      const [sxNumerator, syNumerator] = getStdDevNumerators(bundle);
      if (
        n.equals(ZERO) ||
        n.equals(ONE) ||
        sxNumerator.lessThan(ZERO) ||
        syNumerator.lessThan(ZERO)
      ) {
        return {...state, wasG: false, error: 2};
      }
      const [sX, sY] = stdDev(n, sxNumerator, syNumerator);
      updates = {
        x: sX,
        y: sY,
        wasResult: ResultState.REGULAR,
      };

      break;
    }
    case 'Enter': // fallthrough to lastx (hp12c)
    case '+': {
      // lastx (hp12c platinum)
      updates = {
        hasInput: true,
        x: state.lastX,
      };
      if (state.wasResult === ResultState.REGULAR) {
        // LIFT
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
      const updated: StatsRegisterBundle = subPoint(state.x, state.y, makeRegisterBundle(state));
      registers[1] = updated.n;
      registers[2] = updated.sumX;
      registers[3] = updated.sumX2;
      registers[4] = updated.sumY;
      registers[5] = updated.sumY2;
      registers[6] = updated.sumXY;
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
      const [month, day, year] = getDecimalDMY(state.mDotDY, state.y);
      const validation = validateDate(month, day);
      if (validation) {
        return {...state, error: 8, wasG: false};
      }
      const [nyear, nmonth, ndate, ndow] = plusDays(month, day, year, state.x);

      let newX;
      let displaySpecial: string;
      if (state.mDotDY) {
        newX = nmonth + ndate * 0.01 + nyear * 0.000001;
        displaySpecial =
          '' + spacePad(nmonth, 2) + ',' + zeroPad(ndate, 2) + ',' + nyear + ' ' + ndow;
      } else {
        newX = ndate + nmonth * 0.01 + nyear * 0.000001;
        displaySpecial =
          '' + +spacePad(ndate, 2) + ',' + zeroPad(nmonth + 1, 2) + ',' + nyear + ' ' + ndow;
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
      const [stMonth, stDay, stYear] = getDecimalDMY(state.mDotDY, state.y);
      const [enMonth, enDay, enYear] = getDecimalDMY(state.mDotDY, state.x);

      if (validateDate(stMonth, stDay) || validateDate(enMonth, enDay)) {
        return {...state, error: 8, wasG: false};
      }
      console.log(
        'START DATE: ' +
          stMonth.toNumber() +
          '/' +
          stDay.toNumber() +
          '/' +
          stYear.toNumber() +
          '\n' +
          'END DATE: ' +
          enMonth.toNumber() +
          '/' +
          enDay.toNumber() +
          '/' +
          enYear.toNumber()
      );

      updates = {
        y: dateDiff360(stYear, stMonth, stDay, enYear, enMonth, enDay),
        x: dateDiff(stYear, stMonth, stDay, enYear, enMonth, enDay),
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
      // GTO
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
    case 'sto':
    case 'rcl': {
      // unset G, reduce normally
      return calcApp({...state, wasG: false}, action);
    }
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
        I: div(state.x, TWELVE),
        x: div(state.x, TWELVE),
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
      console.log('flow number will be ' + 0);
      updates = {
        registers,
        wasResult: ResultState.REGULAR,
        hasInput: true,
        N: ZERO,
        cashFlows: [{amount: state.x, count: ONE, flowNumber: 0}],
      };
      break;
    }
    case 'PMT': {
      // CFj

      if (state.wasRcl) {
        if (state.N.greaterThanOrEqualTo(TWENTY)) {
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
      const cashFlowCounts: Decimal[] = state.cashFlowCounts.slice();
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
      if (state.N.greaterThanOrEqualTo(TWENTY)) {
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
      const curGto = state.gtoScratch.slice();
      curGto.push(action.type);
      const counter = curGto[0] * 10 + curGto[1];
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
