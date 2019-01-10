import {Decimal} from 'decimal.js';

export enum ResultState {
  NONE = 'NONE',
  REGULAR = 'REGULAR',
  STATISTICS = 'STATISTICS',
  ENTER = 'ENTER',
}
export interface CashFlowEntry {
  amount: Decimal;
  count: Decimal;
  flowNumber: number;
}

export interface State {
  mDotDY: boolean;
  wasG: boolean;
  wasF: boolean;
  hasInput: boolean;
  wasResult: ResultState;
  wasSto: boolean;
  stoOp?: string;
  backspace: boolean;
  backspaceStates: State[];
  wasRcl: boolean;

  dec: Decimal;
  N: Decimal;
  PV: Decimal;
  I: Decimal;
  FV: Decimal;
  PMT: Decimal;
  x: Decimal;
  lastX: Decimal;
  y: Decimal;
  z: Decimal;
  t: Decimal;
  begEnd: Decimal;
  registers: Decimal[];
  cashFlowCounts: Decimal[];
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

export interface StateUpdate {
  mDotDY?: boolean;
  wasG?: boolean;
  wasF?: boolean;
  hasInput?: boolean;
  wasResult?: ResultState;
  wasSto?: boolean;
  stoOp?: string;
  backspace?: boolean;
  backspaceStates?: State[];
  wasRcl?: boolean;

  dec?: Decimal;
  N?: Decimal;
  PV?: Decimal;
  I?: Decimal;
  FV?: Decimal;
  PMT?: Decimal;
  x?: Decimal;
  lastX?: Decimal;
  y?: Decimal;
  stack3?: Decimal;
  stack4?: Decimal;
  begEnd?: Decimal;
  registers?: Decimal[];

  cashFlows?: CashFlowEntry[];
}

export type ActionType =
  | 'setState'
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

  value?: State;
}
