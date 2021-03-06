import {Action, ResultState, State, StateUpdate} from './interfaces';
import {add, div, isZero, mul, notInValueRange, sub} from './util';
import {calcApp} from './redux_actions';

export function reduceSto(state: State, action: Action): State {
  // console.log('reduce sto ' + action.type);
  let updates: StateUpdate;
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4: {
      const registers = state.registers.slice();
      let registerNo: number = action.type;
      let newRegValue = state.x;
      if (state.stoOp !== null) {
        console.log('state.stoOp = ', state.stoOp);
        if (state.stoOp === '+') {
          newRegValue = add(registers[action.type], state.x);
        } else if (state.stoOp === '-') {
          newRegValue = sub(registers[action.type], state.x);
        } else if (state.stoOp === 'times') {
          newRegValue = mul(registers[action.type], state.x);
        } else if (state.stoOp === 'div') {
          if (isZero(state.x)) {
            return {...state, wasSto: false, error: 0};
          }
          newRegValue = div(registers[action.type], state.x);
        } else if (state.stoOp === '.') {
          registerNo = 10 + action.type;
        }
      } else {
        console.log('StoOp is null');
      }
      console.log('new reg value is ' + newRegValue);
      if (notInValueRange(newRegValue)) {
        console.log('new reg value is unhappy');
        return {...state, wasSto: false, error: 1};
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
      const registers = state.registers.slice();
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
    case 'rcl':
      return {...state, wasSto: false, wasRcl: true};
    case 'EEX':
      return {...state, wasSto: false, compoundInterest: !state.compoundInterest};
    default:
      return calcApp({...state, wasSto: false}, action);
  }
  if (updates) {
    updates = {...updates, wasSto: false, wasResult: ResultState.REGULAR};
    // konsole.log(updates);
    return {...state, ...updates};
  }
  return state;
}
