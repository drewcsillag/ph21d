import {State, StateUpdate, Action} from 'interfaces';
const konsole = console;

export function reduceSto(state: State, action: Action) {
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
    //TODO clear wasSto, delegate to back to calcApp
  }
  if (updates) {
    updates = {...updates, wasSto: false, wasResult: 1};
    konsole.log(updates);
    return {...state, ...updates};
  }
}
