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
  onChangeSubscribers: Array<(v: Type) => void>;
  onFinishChangeSubscribers: Array<(v: Type) => void>;
  constructor(public value: Type) {
    this.onChangeSubscribers = [];
    this.onFinishChangeSubscribers = [];
    this.value = value;
  }
  subscribeOnChange(subscriber: (v: Type) => void) {
    this.onChangeSubscribers.push(subscriber);
  }
  subscribeOnFinishChange(subscriber: (v: Type) => void) {
    this.onFinishChangeSubscribers.push(subscriber);
  }
}

function setupSubscribableController<Type>(
  subscribable: Subscribable<Type>,
  name: string,
  controller: dat.GUIController
) {
  return controller
    .name(name)
    .onChange((v) => {
      subscribable.onChangeSubscribers.forEach((f) => f(v));
    })
    .onFinishChange((v) => {
      subscribable.onFinishChangeSubscribers.forEach((f) => f(v));
    });
}

export function addSubscribableColor<Type>(
  gui: dat.GUI,
  subscribable: Subscribable<Type>,
  name: string
) {
  return setupSubscribableController(
    subscribable,
    name,
    gui.addColor(subscribable, "value")
  );
}

export function addSubscribable<Type>(
  gui: dat.GUI,
  subscribable: Subscribable<Type>,
  name: string,
  min?: number,
  max?: number,
  step?: number
): dat.GUIController {
  return setupSubscribableController(
    subscribable,
    name,
    gui.add(subscribable, "value", min, max, step)
  );
}
