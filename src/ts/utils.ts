export function modulo(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function randomUniform(min: number, max: number): number {
  return (max - min) * Math.random() + min;
}

export function randomUniformInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
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

export function subsample(array: Array<any>, step: number) {
  return array.filter((e, i) => i % step === step - 1);
}

export function range(n: number): Array<number> {
  return [...Array(n).keys()];
}

export function sum(array: Array<number>): number {
  return array.reduce((a, b) => a + b);
}

export function cartesian(...a: Array<Array<any>>) {
  return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
}
