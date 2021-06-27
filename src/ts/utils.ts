import { Subscribable } from "./subscribable";

export function modulo(a: number, b: number): number {
  return ((a % b) + b) % b;
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

export function isLightMode(): Subscribable<boolean> {
  const light = new Subscribable(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
  );
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", (e) => {
      light.value = e.matches;
      light.callSubscribers();
    });
  return light;
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
