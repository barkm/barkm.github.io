export function modulo(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function randomUniform(low: number, high: number): number {
  return (high - low) * Math.random() + low;
}

export interface WindowSize {
  width: number;
  height: number;
}

export function getWindowSize(): WindowSize {
  const windowSize: WindowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  window.addEventListener("resize", () => {
    windowSize.width = window.innerWidth;
    windowSize.height = window.innerHeight;
  });
  return windowSize;
}

export function range(n: number): Array<number> {
  return [...Array(n).keys()];
}

export function sum(array: Array<number>): number {
  return array.reduce((a, b) => a + b);
}

export class Subscribable<Type> {
  subscribers: Array<(v: Type) => void>;
  value_: Type;
  constructor(value_: Type) {
    this.subscribers = [];
    this.value_ = value_;
  }

  subscribe(subsriber: (v: Type) => void) {
    this.subscribers.push(subsriber);
  }

  set value(v: Type) {
    this.value_ = v;
    this.subscribers.map((s) => s(v));
  }
  get value() {
    return this.value_;
  }
}
