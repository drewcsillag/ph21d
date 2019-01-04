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
  type: string | number;
}
