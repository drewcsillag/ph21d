import {Action, State} from 'interfaces';
import {ResultState} from './util';

export function reduceRcl(state: State, action: Action): State {
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
    case 'sto':
      return {...state, wasRcl: false, wasSto: true};
    default:
    // TODO clear wasRcl, delegate to calcApp
  }
  return {...state, x, wasRcl: false, wasResult: ResultState.REGULAR, hasInput: true};
}
