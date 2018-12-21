export function setValue(id: string, value: any): void {
  (<HTMLInputElement>document.getElementById(id)).value = value;
}
