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
  registers: Array<number>;
  cashFlowCounts: Array<number>;
}

export interface StateUpdate {
  mDotDY?: boolean;
  wasG?: boolean;
  wasF?: boolean;
  hasInput?: boolean;
  wasResult?: ResultState;
  wasSto?: boolean;
  stoOp?: string;

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
  registers?: Array<number>;

  cashFlows?: Array<CashFlowEntry>;
}
export interface Action {
  type: string | number;
}
