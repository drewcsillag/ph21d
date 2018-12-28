export function frac(n: number) {
  let wasneg = 1;
  if (n < 0) {
    wasneg = -1;
  }

  return wasneg * (n * wasneg - Math.floor(n * wasneg));
}
export function intg(n: number) {
  let wasneg = 1;
  if (n < 0) {
    wasneg = -1;
  }
  return Math.floor(n * wasneg) * wasneg;
}

export enum ResultState {
  NONE = 'NONE',
  REGULAR = 'REGULAR',
  STATISTICS = 'STATISTICS',
  ENTER = 'ENTER',
}
