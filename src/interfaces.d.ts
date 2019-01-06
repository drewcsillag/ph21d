import {ResultState} from './util';
export interface CashFlowEntry {
  amount: number;
  count: number;
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

  dec: number;
  N: number;
  PV: number;
  I: number;
  FV: number;
  PMT: number;
  x: number;
  lastX: number;
  y: number;
  stack3: number;
  stack4: number;
  begEnd: number;
  registers: number[];
  cashFlowCounts: number[];
}

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

  dec?: number;
  N?: number;
  PV?: number;
  I?: number;
  FV?: number;
  PMT?: number;
  x?: number;
  lastX?: number;
  y?: number;
  stack3?: number;
  stack4?: number;
  begEnd?: number;
  registers?: number[];

  cashFlows?: CashFlowEntry[];
}
export interface Action {
  type:
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
}
