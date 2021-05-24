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
  callOnChangeSubscribers() {
    this.onChangeSubscribers.forEach((f) => f(this.value));
  }
  callOnFinishChangeSubscribers() {
    this.onFinishChangeSubscribers.forEach((f) => f(this.value));
  }
  callSubscribers() {
    this.callOnChangeSubscribers();
    this.callOnFinishChangeSubscribers();
  }
}

function setupSubscribableController<Type>(
  subscribable: Subscribable<Type>,
  name: string,
  controller: dat.GUIController
) {
  return controller
    .name(name)
    .onChange(() => {
      subscribable.callOnChangeSubscribers();
    })
    .onFinishChange(() => {
      subscribable.callOnFinishChangeSubscribers();
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
