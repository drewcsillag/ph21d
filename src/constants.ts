import Decimal from 'decimal.js';
import {ResultState, State} from './interfaces';

export const PRECISION = 14;
export const ZERO = new Decimal('0');
export const ONE = new Decimal('1');
export const NEG_ONE = new Decimal('-1');
export const TWO = new Decimal(2);
export const HUNDRED = new Decimal('100');
export const TWELVE = new Decimal(12);
export const INITIAL_REGS = [
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
  ZERO,
];
export const INITIAL_FLOW_COUNTS = [
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
  ONE,
];

export const initialState: State = {
  mDotDY: true,
  wasG: false,
  wasF: false,
  hasInput: false,
  wasResult: ResultState.NONE,
  wasSto: false,
  wasRcl: false,
  begEnd: new Decimal('0'),
  backspace: false,
  backspaceStates: [],
  wasGto: false,

  dec: ZERO,

  N: ZERO,
  PV: ZERO,
  PMT: ZERO,
  I: ZERO,
  FV: ZERO,
  x: ZERO,
  lastX: ZERO,
  y: ZERO,
  z: ZERO,
  t: ZERO,
  registers: INITIAL_REGS,
  cashFlowCounts: INITIAL_FLOW_COUNTS,
};
