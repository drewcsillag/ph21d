import {State, Action} from './interfaces';
import {initialState} from './constants';

export function reduceProgramMode(state: State, action: Action): State {
  if (state.wasGto) {
    return reduceProgramGto(state, action);
  }
  if (state.wasSto) {
    return reduceProgramSto(state, action);
  }
  if (state.wasRcl) {
    return reduceProgramRcl(state, action);
  }

  if (state.wasF) {
    return reduceProgramF(state, action);
  }
  if (state.wasG) {
    return reduceProgramG(state, action);
  }
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
      return addSingArgInsn(state, action.type);
    case 'Enter':
      return addSingArgInsn(state, 36);
    case '.':
      return addSingArgInsn(state, 48);
    case '+':
      return addSingArgInsn(state, 40);
    case '-':
      return addSingArgInsn(state, 30);
    case 'times':
      return addSingArgInsn(state, 20);
    case 'div':
      return addSingArgInsn(state, 10);
    case 'percentTotal':
      return addSingArgInsn(state, 23);
    case 'percentChange':
      return addSingArgInsn(state, 24);
    case 'percent':
      return addSingArgInsn(state, 25);
    case 'ytox':
      return addSingArgInsn(state, 21);
    case 'clx':
      return addSingArgInsn(state, 35);
    case 'sigmaPlus':
      return addSingArgInsn(state, 49);
    case 'chs':
      return addSingArgInsn(state, 16);
    case 'recipX':
      return addSingArgInsn(state, 22);
    case 'f':
      return {...state, wasF: true};
    case 'g':
      return {...state, wasG: true};
    case 'swapxy':
      return addSingArgInsn(state, 34);
    case 'sto':
      return {...state, wasSto: true};
    case 'rcl':
      return {...state, wasRcl: true};
    case 'N':
      return addSingArgInsn(state, 11);
    case 'I':
      return addSingArgInsn(state, 12);
    case 'PV':
      return addSingArgInsn(state, 13);
    case 'PMT':
      return addSingArgInsn(state, 14);
    case 'FV':
      return addSingArgInsn(state, 15);
    case 'EEX':
      return addSingArgInsn(state, 26);
    case 'runStop':
      return addSingArgInsn(state, 31);
    case 'rotateStack':
      return addSingArgInsn(state, 33);
    case 'singleStep':
      let counter = state.programEditCounter;
      if (state.programEditCounter === state.programMemory.length - 1) {
        counter = 0;
      } else {
        counter += 1;
      }
      return {...state, programEditCounter: counter};
  }
  return state;
}

function addInsn(state: State, code1: number, code2: number, code3: number): State {
  let insertLocation = state.programEditCounter;
  insertLocation += 1;

  if (insertLocation === 100) {
    return {...state, error: 4, wasF: false, wasG: false, wasSto: false, wasRcl: false};
  }
  const words = state.programMemory.slice();

  if (state.programMemory.length <= insertLocation) {
    for (let i = 0; i < 7; i++) {
      words.push({arg1: 43, arg2: 33, arg3: 0});
    }
  }
  words[insertLocation] = {arg1: code1, arg2: code2, arg3: code3};
  return {...state, programEditCounter: insertLocation, programMemory: words};
}

function addSingArgInsn(state: State, code: number): State {
  return addInsn(state, code, null, null);
}

function addGInsn(state: State, code: number): State {
  return addInsn(state, 43, code, null);
}

export function reduceProgramG(state: State, action: Action): State {
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
      return addGInsn(state, action.type);
    case 4:
      return {...state, mDotDY: false, wasG: false};
    case 5:
      return {...state, mDotDY: true, wasG: false};
    case 6:
    case 7:
    case 8:
      return addGInsn(state, action.type);
    case 9: //TODO MEM

    case 'Enter': {
      const newState = addSingArgInsn(state, 36);
      return {...newState, wasG: false};
    }
    case '.':
      return addGInsn(state, 48);
    case '+':
      return addGInsn(state, 40);
    case '-':
      return addGInsn(state, 30);
    case 'times':
      return addGInsn(state, 20);
    case 'div':
      return addGInsn(state, 10);
    case 'percentTotal':
      return addGInsn(state, 23);
    case 'percentChange':
      return addGInsn(state, 24);
    case 'percent':
      return addGInsn(state, 25);
    case 'ytox':
      return addGInsn(state, 21);
    case 'clx':
      return addGInsn(state, 35);
    case 'sigmaPlus':
      return addGInsn(state, 49);
    case 'chs':
      return addGInsn(state, 16);
    case 'recipX':
      return addGInsn(state, 22);
    case 'f':
      return {...state, wasF: true, wasG: false};
    case 'g':
      return state;
    case 'swapxy':
      return addGInsn(state, 23);
    case 'sto':
      return {...state, wasSto: true, wasF: false};
    case 'rcl':
      return addGInsn(state, 45);
    case 'N':
      return addGInsn(state, 11);
    case 'I':
      return addGInsn(state, 12);
    case 'PV':
      return addGInsn(state, 13);
    case 'PMT':
      return addGInsn(state, 14);
    case 'FV':
      return addGInsn(state, 15);
    case 'EEX':
      return addGInsn(state, 26);
    case 'singleStep': {
      let counter = state.programEditCounter;
      if (state.programEditCounter === 0) {
        counter = state.programMemory.length - 1;
      } else {
        counter -= 1;
      }
      return {...state, wasG: false, programEditCounter: counter};
    }
    case 'runStop':
      return addGInsn(state, 31);
    case 'rotateStack':
      return {...state, wasGto: true, wasG: false};
  }
  return state;
}

export function reduceProgramF(state: State, action: Action): State {
  let newState: State;
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
      newState = addInsn(state, 42, action.type, null);
      break;
    case 'Enter':
      newState = {...state, wasF: false};
      break;
    case '.':
      newState = addInsn(state, 42, 48, null);
      break;
    case '+':
      newState = addInsn(state, 40, null, null);
      break;
    case '-':
      newState = addInsn(state, 30, null, null);
      break;
    case 'times':
      newState = addInsn(state, 20, null, null);
      break;
    case 'div':
      newState = addInsn(state, 10, null, null);
      break;

    case 'percentTotal':
      newState = addInsn(state, 42, 23, null);
      break;
    case 'percentChange':
      newState = addInsn(state, 42, 24, null);
      break;
    case 'percent':
      newState = addInsn(state, 42, 25, null);
      break;
    case 'ytox':
      newState = addInsn(state, 42, 21, null);
      break;
    case 'clx':
      newState = {...state, wasF: false};
      break;
    case 'sigmaPlus':
      newState = addInsn(state, 49, null, null);
      break;
    case 'chs':
      newState = addInsn(state, 42, 16, null);
      break;

    case 'recipX':
      newState = addInsn(state, 42, 16, null);
      break;
    case 'f':
      newState = state;
      break;
    case 'g':
      newState = {...state, wasG: true};
      break;
    case 'swapxy':
      newState = addInsn(state, 42, 34, null);
      break;
    case 'sto':
      return reduceProgramMode({...state, wasF: false}, action);
    case 'rcl':
      return reduceProgramMode({...state, wasF: false}, action);
    case 'N':
      newState = addInsn(state, 42, 11, null);
      break;
    case 'I':
      newState = addInsn(state, 42, 12, null);
      break;
    case 'PV':
      newState = addInsn(state, 42, 13, null);
      break;

    case 'PMT':
      newState = addInsn(state, 42, 14, null);
      break;

    case 'FV':
      newState = addInsn(state, 42, 15, null);
      break;

    case 'EEX':
      newState = addInsn(state, 42, 26, null);
      break;

    case 'singleStep':
      newState = addInsn(state, 42, 32, null);
      break;

    case 'runStop': {
      return {...state, programMode: false};
    }
    case 'rotateStack': {
      return {...state, programEditCounter: 0, programMemory: initialState.programMemory};
    }
  }
  return {...newState, wasF: false};
}

function reduceProgramGto(state: State, action: Action): State {
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
      if (curGto.length === 3) {
        const addIt = addInsn(state, 43, 33, curGto[0] * 100 + curGto[1] * 10 + curGto[0]);
        return {...addIt, wasGto: false, gtoScratch: []};
      }
      return {...state, gtoScratch: curGto};
    }
    case 'Enter':
    case '.':
    case '+':
    case '-':
    case 'times':
    case 'div':
    case 'percentTotal':
    case 'percentChange':
    case 'percent':
    case 'ytox':
    case 'clx':
    case 'sigmaPlus':
    case 'chs':
    case 'recipX':
    case 'rotateStack':
    case 'f':
    case 'g':
    case 'swapxy':
    case 'sto':
    case 'rcl':
    case 'N':
    case 'I':
    case 'PV':
    case 'PMT':
    case 'FV':
    case 'runStop':
    case 'EEX':
    case 'singleStep': {
      const undoState = {...state, wasGto: false, gtoScratch: [] as number[]};
      return reduceProgramMode(undoState, action);
    }
  }
}
function reduceProgramSto(state: State, action: Action): State {
  switch (action.type) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4: {
      let newState;
      if (state.stoOp == null) {
        newState = addInsn(state, 44, action.type, null);
      } else {
        if (state.stoOp === '.') {
          newState = addInsn(state, 44, 48, action.type);
        } else if (state.stoOp === '+') {
          newState = addInsn(state, 44, 40, action.type);
        } else if (state.stoOp === '-') {
          newState = addInsn(state, 44, 30, action.type);
        } else if (state.stoOp === 'times') {
          newState = addInsn(state, 44, 20, action.type);
        } else if (state.stoOp === 'div') {
          newState = addInsn(state, 44, 10, action.type);
        }
      }
      return {...newState, wasSto: false, stoOp: null};
    }
    case 5:
    case 6:
    case 7:
    case 8:
    case 9: {
      if (state.stoOp === '.') {
        const newState = addInsn(state, 44, 48, action.type);
        return {...newState, wasSto: false, stoOp: null};
      } else if (state.stoOp !== null) {
        return {...state, error: 4, wasSto: false};
      }
      const newState = addInsn(state, 44, action.type, null);
      return {...newState, wasSto: false};
    }
    case 'Enter':
    case '.':
      return {...state, stoOp: '.'};
    case '+':
    case '-':
    case 'times':
    case 'div':
      return {...state, stoOp: action.type};
    case 'N':
      return {...addInsn(state, 44, 11, null), wasSto: false};
    case 'I':
      return {...addInsn(state, 44, 12, null), wasSto: false};
    case 'PV':
      return {...addInsn(state, 44, 13, null), wasSto: false};
    case 'PMT':
      return {...addInsn(state, 44, 14, null), wasSto: false};
    case 'FV':
      return {...addInsn(state, 44, 15, null), wasSto: false};
    case 'percentTotal':
    case 'percentChange':
    case 'percent':
    case 'ytox':
    case 'clx':
    case 'sigmaPlus':
    case 'chs':
    case 'recipX':
    case 'rotateStack':
    case 'f':
    case 'g':
    case 'swapxy':
    case 'sto':
    case 'rcl':
    case 'runStop':
    case 'EEX':
    case 'singleStep':
      return reduceProgramMode({...state, wasSto: false, stoOp: null}, action);
  }
}

function reduceProgramRcl(state: State, action: Action): State {
  let newState: State;
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
      if (state.stoOp === '.') {
        newState = addInsn(state, 44, 48, action.type);
      } else if (state.stoOp === null) {
        newState = addInsn(state, 44, action.type, null);
      } else {
        newState = {...state, error: 4};
      }
      break;
    }
    case 'N': {
      if (state.wasG) {
        newState = addInsn(state, 45, 43, 11);
      } else {
        newState = addInsn(state, 45, 11, null);
      }
      break;
    }
    case 'I': {
      if (state.wasG) {
        newState = addInsn(state, 45, 43, 12);
      } else {
        newState = addInsn(state, 45, 12, null);
      }
      break;
    }
    case 'PMT': {
      if (state.wasG) {
        newState = addInsn(state, 45, 43, 14);
      } else {
        newState = addInsn(state, 45, 14, null);
      }
      break;
    }
    case 'FV': {
      if (state.wasG) {
        newState = addInsn(state, 45, 43, 15);
      } else {
        newState = addInsn(state, 45, 15, null);
      }
      break;
    }
    case 'f': {
      return {...state, wasG: false, wasF: true};
    }
    case 'g': {
      return {...state, wasG: true};
    }
    case 'PV': {
      newState = addInsn(state, 45, 14, null);
      break;
    }
    case 'sto': {
      return reduceProgramMode({...state, wasRcl: false, wasG: false}, action);
    }
    case 'Enter':
    case '.':
    case '+':
    case '-':
    case 'times':
    case 'div':
    case 'percentTotal':
    case 'percentChange':
    case 'percent':
    case 'ytox':
    case 'clx':
    case 'sigmaPlus':
    case 'chs':
    case 'recipX':
    case 'rotateStack':
    case 'swapxy':
    case 'rcl':
    case 'runStop':
    case 'EEX':
    case 'singleStep': {
      return reduceProgramMode({...state, wasRcl: false, wasG: false}, action);
    }
  }
  return {...newState, wasRcl: false};
}
