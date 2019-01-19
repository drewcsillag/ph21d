import Decimal from 'decimal.js';
import {ActionType, ProgramWord, ResultState, State} from './interfaces';

export const ZERO = new Decimal('0');
export const ONE = new Decimal('1');
export const NEG_ONE = new Decimal('-1');
export const TWO = new Decimal(2);
export const HUNDRED = new Decimal('100');
export const TEN = new Decimal(10);
export const TWELVE = new Decimal(12);
export const TWENTY = new Decimal(20);
export const THIRTY = new Decimal(30);
export const THIRTY_ONE = new Decimal(31);

export const INITIAL_REGS = (() => {
  const l = [];
  for (let i = 0; i < 20; i++) {
    l.push(ZERO);
  }
  return l;
})();

export const INITIAL_FLOW_COUNTS = INITIAL_REGS.map(() => ONE);

function makeEmptyProgramMemory(): ProgramWord[] {
  const words = [];
  for (let i = 0; i < 9; i++) {
    words.push({arg1: 43, arg2: 33, arg3: 0});
  }
  return words;
}

export const initialState: State = {
  mDotDY: true,
  wasG: false,
  wasF: false,
  hasInput: false,
  wasResult: ResultState.NONE,
  wasSto: false,
  wasRcl: false,
  begEnd: ZERO,
  backspace: false,
  backspaceStates: [],
  wasGto: false,
  fPrecision: 2,
  inputChars: '',
  error: null,
  programMode: false,
  programCounter: 0,
  programEditCounter: 0,
  programRunning: false,
  programMemory: makeEmptyProgramMemory(),
  displaySpecial: null,
  gtoScratch: [],
  dec: ZERO,
  stoOp: null,
  eexValue: null,
  N: ZERO,
  PV: ZERO,
  PMT: ZERO,
  I: ZERO,
  FV: ZERO,
  x: ZERO,
  xInpPrec: 0,
  lastX: ZERO,
  y: ZERO,
  z: ZERO,
  t: ZERO,
  registers: INITIAL_REGS,
  cashFlowCounts: INITIAL_FLOW_COUNTS,
};

export const MAX_VALUE = new Decimal('9.999999999e+99');
export const MIN_VALUE = new Decimal('-9.999999999e+99');

const keys: ActionType[] = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,

  'div',
  'N',
  'I',
  'PV',
  'PMT',
  'FV',
  'chs',
  'noop', // 17
  'noop', // 18
  'noop', // 19

  'times', // 20
  'ytox',
  'recipX',
  'percentTotal',
  'percentChange',
  'percent',
  'EEX',
  'noop', // 27
  'noop', // 28
  'noop', // 29

  '-',
  'runStop',
  'singleStep',
  'rotateStack',
  'swapxy',
  'clx',
  'Enter',
  'noop', // 37
  'noop', // 38
  'noop', // 39

  '+',
  'noop',
  'f',
  'g',
  'sto',
  'rcl',
  'noop',
  'noop',
  '.',
  'singleStep',
];

export const ActionToCode: Map<ActionType, number> = (() => {
  return new Map(
    new Array<[ActionType, number]>(...keys.map((ac, ind): [ActionType, number] => [ac, ind]))
  );
})();

export const CodeToAction: Map<number, ActionType> = (() => {
  return new Map(
    new Array<[number, ActionType]>(...keys.map((ac, ind): [number, ActionType] => [ind, ac]))
  );
})();
