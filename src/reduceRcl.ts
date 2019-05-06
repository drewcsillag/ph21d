import {ZERO} from './constants';
import {Action, ResultState, State} from './interfaces';
import {calcApp} from './redux_actions';

export function reduceRcl(state: State, action: Action): State {
  let x = ZERO;
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
      return calcApp({...state, wasRcl: false}, action);
  }

  let t = state.t;
  let z = state.z;
  let y = state.y;

  if (state.wasResult === ResultState.REGULAR) {
    t = z;
    z = y;
    y = state.x;
  }
  return {
    ...state,
    x,
    y,
    z,
    t,
    wasRcl: false,
    wasResult: ResultState.REGULAR,
    hasInput: true,
  };
}
