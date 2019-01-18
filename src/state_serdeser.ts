import Decimal from 'decimal.js';
import {ResultState, State} from './interfaces';

export function serializeState(state: State): string {
  return JSON.stringify(state);
}

export function deserializeState(input: string): State {
  const basic = JSON.parse(input);
  const wrString: string = basic.wasResult as string;
  let wasResult: ResultState;

  switch (wrString) {
    case 'REGULAR':
      wasResult = ResultState.REGULAR;
      break;
    case 'NONE':
      wasResult = ResultState.NONE;
      break;
    case 'NOLIFT':
      wasResult = ResultState.NOLIFT;
      break;
    default:
      throw new Error('RESULT STATE IS UNKNOWN -> ' + wrString);
  }

  const serState: State = {
    mDotDY: basic.mDotDY,
    wasG: basic.wasG,
    wasF: basic.wasF,
    hasInput: basic.hasInput,
    wasResult,
    wasSto: basic.wasSto,
    stoOp: basic.stoOp,
    backspace: false,
    backspaceStates: [],
    wasRcl: basic.wasRcl,
    wasGto: basic.wasGto,
    inputChars: basic.inputChars,
    fPrecision: basic.fPrecision,
    error: basic.error,
    programMode: basic.programMode,
    programMemory: basic.programMemory,
    programEditCounter: basic.programEditCounter,
    programCounter: basic.programCounter,
    programRunning: false,
    gtoScratch: basic.gtoScratch,

    eexValue: basic.eexValue,
    displaySpecial: basic.displaySpecial,
    dec: new Decimal(basic.dec),
    N: new Decimal(basic.N),
    PV: new Decimal(basic.PV),
    I: new Decimal(basic.I),
    FV: new Decimal(basic.FV),
    PMT: new Decimal(basic.PMT),
    x: new Decimal(basic.x),
    xInpPrec: basic.xInpPrec,
    lastX: new Decimal(basic.lastX),
    y: new Decimal(basic.y),
    z: new Decimal(basic.z),
    t: new Decimal(basic.t),
    begEnd: new Decimal(basic.begEnd),
    registers: basic.registers.map((x: string) => new Decimal(x)),
    cashFlowCounts: basic.cashFlowCounts.map((x: string) => new Decimal(x)),
  };
  return serState;
}
