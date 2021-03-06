import {Decimal} from 'decimal.js';

export enum ResultState {
  NONE = 'NONE',
  REGULAR = 'REGULAR',
  NOLIFT = 'NOLIFT',
}
export interface CashFlowEntry {
  amount: Decimal;
  count: Decimal;
  flowNumber: number;
}

export interface ProgramWord {
  arg1: number;
  arg2?: number;
  arg3?: number;
}
export interface State {
  mDotDY: boolean;
  wasG: boolean;
  wasF: boolean;
  hasInput: boolean;
  wasResult: ResultState;
  wasSto: boolean;
  stoOp: ActionType;
  backspace: boolean;
  backspaceStates: State[];
  wasRcl: boolean;
  wasGto: boolean;
  inputChars: string;
  fPrecision: number;
  error: digit | null;
  programMode: boolean;
  programMemory: ProgramWord[];
  programEditCounter: number;
  programCounter: number;
  programRunning: boolean;
  gtoScratch: number[];

  eexValue: EEXData;
  displaySpecial: string;
  dec: Decimal;
  N: Decimal;
  PV: Decimal;
  I: Decimal;
  FV: Decimal;
  PMT: Decimal;
  x: Decimal;
  xInpPrec: number;
  lastX: Decimal;
  y: Decimal;
  z: Decimal;
  t: Decimal;
  begEnd: Decimal;
  registers: Decimal[];
  cashFlowCounts: Decimal[];
  compoundInterest: boolean;
}

export type StateKey =
  | 'mDotDY'
  | 'wasG'
  | 'wasF'
  | 'hasInput'
  | 'wasResult'
  | 'wasSto'
  | 'stoOp'
  | 'backspace'
  | 'backspaceStates'
  | 'wasRcl'
  | 'dec'
  | 'N'
  | 'PV'
  | 'I'
  | 'FV'
  | 'PMT'
  | 'x'
  | 'y'
  | 'z'
  | 't'
  | 'begEnd'
  | 'registers'
  | 'cashFlowCounts';

export type digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EEXData {
  origX: Decimal;
  exponent: number;
  positive: boolean;
}
export interface StateUpdate {
  mDotDY?: boolean;
  wasG?: boolean;
  wasF?: boolean;
  hasInput?: boolean;
  wasResult?: ResultState;
  wasSto?: boolean;
  stoOp?: ActionType;
  backspace?: boolean;
  backspaceStates?: State[];
  wasRcl?: boolean;
  inputChars?: string;
  fPrecision?: number;
  error?: digit | null;
  eexValue?: EEXData;

  cashFlowCounts?: Decimal[];
  simpleInterest?: boolean;
  programRunning?: boolean;
  programMode?: boolean;
  programMemory?: ProgramWord[];
  programCounter?: number;
  programEditCounter?: number;
  gtoScratch?: number[];
  dec?: Decimal;
  N?: Decimal;
  PV?: Decimal;
  I?: Decimal;
  FV?: Decimal;
  PMT?: Decimal;
  x?: Decimal;
  xInpPrec?: number;
  lastX?: Decimal;
  y?: Decimal;
  z?: Decimal;
  t?: Decimal;
  begEnd?: Decimal;
  registers?: Decimal[];
  displaySpecial?: string;
  cashFlows?: CashFlowEntry[];
}

export type ActionType =
  // internal actions
  | 'setState'
  | 'noop'
  | 'gto'
  // button actions
  | '.'
  | '+'
  | 'Enter'
  | '-'
  | 'clx'
  | 'EEX'
  | 'singleStep'
  | 'runStop'
  | 'FV'
  | 'PV'
  | 'PMT'
  | 'I'
  | 'N'
  | 'rcl'
  | 'sto'
  | 'swapxy'
  | 'f'
  | 'g'
  | 'rotateStack'
  | 'recipX'
  | 'chs'
  | 'sigmaPlus'
  | 'percent'
  | 'percentTotal'
  | 'percentChange'
  | 'ytox'
  | 'div'
  | 'times'
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;
export interface Action {
  type: ActionType;

  value?: State; // for setState
  fromRunner?: boolean; // to denote action is being delivered by the program runner, rather than the keyboard
  gtoTarget?: number;
}

export interface StatsRegisterBundle {
  n: Decimal;
  sumX: Decimal;
  sumX2: Decimal;
  sumY: Decimal;
  sumY2: Decimal;
  sumXY: Decimal;
}

export function makeRegisterBundle(state: State): StatsRegisterBundle {
  return {
    n: state.registers[1],
    sumX: state.registers[2],
    sumX2: state.registers[3],
    sumY: state.registers[4],
    sumY2: state.registers[5],
    sumXY: state.registers[6],
  };
}
