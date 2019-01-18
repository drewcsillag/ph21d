import {Store} from 'redux';
import {ActionToCode, CodeToAction, initialState} from './constants';
import {Action, ActionType, ProgramWord, State} from './interfaces';
import {displayCodeLine} from './util';

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
    case 'N':
    case 'I':
    case 'PV':
    case 'PMT':
    case 'FV':
    case 'EEX':
    case 'runStop':
    case 'rotateStack':
      return addSingArgInsn(state, ActionToCode.get(action.type));
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
  return {...addInsn(state, 43, code, null), wasG: false};
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
    case 9: // TODO MEM

    case 'Enter': {
      const newState = addSingArgInsn(state, 36);
      return {...newState, wasG: false};
    }
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
    case 'rcl':
    case 'N':
    case 'I':
    case 'PV':
    case 'PMT':
    case 'FV':
    case 'EEX':
    case 'swapxy':
    case 'runStop':
    case 'recipX':
      return addGInsn(state, ActionToCode.get(action.type));
    case 'f':
      return {...state, wasF: true, wasG: false};
    case 'g':
      return state;
    case 'sto':
      return {...state, wasSto: true, wasF: false};

    case 'singleStep': {
      let counter = state.programEditCounter;
      if (state.programEditCounter === 0) {
        counter = state.programMemory.length - 1;
      } else {
        counter -= 1;
      }
      return {...state, wasG: false, programEditCounter: counter};
    }
    case 'rotateStack':
      return {...state, wasGto: true, wasG: false};
  }
  return state;
}

export function reduceProgramF(state: State, action: Action): State {
  let newState: State;
  switch (action.type) {
    case 'Enter':
      newState = {...state, wasF: false};
      break;
    case '+':
    case '-':
    case 'times':
    case 'div':
      newState = addInsn(state, ActionToCode.get(action.type), null, null);
      break;

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
    case 'N':
    case 'I':
    case 'PMT':
    case 'FV':
    case 'EEX':
    case 'singleStep':
    case 'swapxy':
    case 'chs':
    case 'recipX':
    case '.':
    case 'percentChange':
    case 'percent':
    case 'ytox':
      newState = addInsn(state, 42, ActionToCode.get(action.type), null);
      break;

    case 'clx':
      newState = {...state, wasF: false};
      break;
    case 'sigmaPlus':
      newState = addInsn(state, 49, null, null);
      break;

    case 'f':
      newState = state;
      break;
    case 'g':
      newState = {...state, wasG: true};
      break;
    case 'sto':
      return reduceProgramMode({...state, wasF: false}, action);
    case 'rcl':
      return reduceProgramMode({...state, wasF: false}, action);

    case 'runStop': {
      return {...state, wasF: false, programMode: false};
    }
    case 'rotateStack': {
      return {
        ...state,
        wasF: false,
        programEditCounter: 0,
        programMemory: initialState.programMemory,
      };
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
      const curGto = state.gtoScratch.slice();
      curGto.push(action.type);
      const counter = curGto[0] * 10 + curGto[1];
      if (curGto.length < 2) {
        return {...state, gtoScratch: curGto};
      }
      const addIt = addInsn(state, 43, 33, counter);
      if (state.stoOp !== '.') {
        return {...addIt, wasGto: false, gtoScratch: []};
      }
      if (counter >= state.programMemory.length) {
        return {...state, error: 4, wasGto: false, stoOp: null, gtoScratch: []};
      }
      console.log('going to ' + counter + '  ' + curGto);
      return {...state, programEditCounter: counter, stoOp: null, wasGto: false, gtoScratch: []};
    }
    case '.': {
      return {...state, stoOp: '.'};
    }
    case 'Enter':
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
      const undoState: State = {...state, wasGto: false, gtoScratch: [], stoOp: null};
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
        newState = addInsn(state, 44, ActionToCode.get(state.stoOp), action.type);
      }
      return {...newState, wasSto: false, stoOp: null};
    }
    case 5:
    case 6:
    case 7:
    case 8:
    case 9: {
      if (state.stoOp === '.') {
        return {...addInsn(state, 44, 48, action.type), wasSto: false, stoOp: null};
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
    case 'I':
    case 'PV':
    case 'PMT':
    case 'FV':
      return {...addInsn(state, 44, ActionToCode.get(action.type), null), wasSto: false};
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
      console.log('stoOp is ', state.stoOp);
      if (state.stoOp === '.') {
        newState = addInsn(state, 45, 48, action.type);
      } else if (state.stoOp === null) {
        newState = addInsn(state, 45, action.type, null);
      } else {
        newState = {...state, error: 4};
      }
      break;
    }
    case 'N':
    case 'I':
    case 'PMT':
    case 'FV': {
      if (state.wasG) {
        newState = addInsn(state, 45, 43, ActionToCode.get(action.type));
      } else {
        newState = addInsn(state, 45, ActionToCode.get(action.type), null);
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
    case '.': {
      return {...state, stoOp: '.'};
    }

    case 'Enter':
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

function createActionsForWord(word: ProgramWord): Action[] {
  const result: Action[] = [];
  result.push({type: CodeToAction.get(word.arg1), fromRunner: true});
  if (word.arg2 != null) {
    result.push({type: CodeToAction.get(word.arg2), fromRunner: true});
  }
  if (word.arg3 != null) {
    result.push({type: CodeToAction.get(word.arg3), fromRunner: true});
  }
  return result;
}

export function programRunner(
  store: Store,
  numInsns = 10,
  byTimer: boolean,
  stopAsync: () => void,
  pauseRun: () => void
): void {
  let state: State;
  state = store.getState();

  //   console.log('bytimeris ', byTimer, ' program running? ', state.programRunning);
  if (byTimer && !state.programRunning) {
    // console.log('program not running!');
    return;
  }
  console.log('running program!');
  let counter = numInsns;
  let keepRunning = true;

  function stop() {
    keepRunning = false;
    store.dispatch({
      type: 'setState',
      value: {...store.getState(), programRunning: false, displaySpecial: null},
      fromRunner: true,
    });
    stopAsync();
  }
  store.dispatch({
    type: 'setState',
    fromRunner: true,
    value: {...state, programRunning: true, displaySpecial: 'running'},
  });

  while (counter > 0 && keepRunning) {
    counter -= 1;
    let checkForAdvance = false;
    // bump the program counter
    const whileState = store.getState();
    const newPC = whileState.programCounter + 1;
    if (newPC >= whileState.programMemory.length) {
      stop();
      store.dispatch({
        type: 'gto',
        fromRunner: true,
        displaySpecial: 'running',
        gtoTarget: 0,
      });
      return;
    }
    store.dispatch({
      type: 'gto',
      gtoTarget: newPC,
      fromRunner: true,
    });
    // get the word and create ations
    const word = state.programMemory[newPC];
    console.log(
      'word is [',
      displayCodeLine(newPC, word),
      '] PC is',
      newPC,
      'word length ' + state.programMemory.length
    );
    let actions: Action[];

    if (word.arg1 === 43 && word.arg2 === 33) {
      // G GTO
      if (numInsns === 1) {
        counter += 1;
      }
      console.log("goto'ing " + word.arg3);
      actions = [{type: 'gto', gtoTarget: word.arg3 - 1, fromRunner: true}];
    } else if (word.arg1 === 43 && (word.arg2 === 34 || word.arg2 === 35)) {
      // X<=Y, X=0
      // conditionals
      checkForAdvance = true;
      actions = createActionsForWord(word);
    } else if (word.arg1 === 31) {
      console.log('RUN?STOP');
      // R/S
      stop();
      break;
    } else {
      actions = createActionsForWord(word);
    }

    // run the actions
    for (const action of actions) {
      store.dispatch(action);
      if (store.getState().error != null) {
        stop();
        return;
      }
    }
    // if we GTO'd to 0, stop
    if (store.getState().programCounter === -1) {
      stop();
      store.dispatch({
        type: 'setState',
        fromRunner: true,
        value: {...store.getState(), programCounter: 0},
      });
      return;
    }

    if (checkForAdvance && store.getState().programCounter !== newPC) {
      checkForAdvance = false;
      counter += 1; // run another
    }
    if (word.arg1 === 43 && (word.arg2 === 31 || word.arg2 === 16)) {
      console.log('PPPAAAUUUSSSEEE');
      store.dispatch({
        type: 'setState',
        fromRunner: true,
        value: {...store.getState(), displaySpecial: null},
      });

      pauseRun();
      break;
    }
  }
  // stop();
}
