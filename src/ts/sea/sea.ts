import * as THREE from "three";

import {
  Subscribable,
  addSubscribable,
  addSubscribableColor,
} from "../subscribable";
import { Time } from "../three/utils";

import { addBottom } from "./bottom/bottom";
import { addSurface } from "./surface";
import { addTurtle } from "./turtle";

export interface SeaParameters {
  color: Subscribable<string>;
  visibility: {
    min: Subscribable<number>;
    max: Subscribable<number>;
  };
  depth: Subscribable<number>;
  width: number;
  height: number;
}

export function addSea(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  gui: dat.GUI,
  time: Subscribable<Time>
) {
  const parameters: SeaParameters = {
    color: new Subscribable("#7696ff"),
    visibility: { min: new Subscribable(5.0), max: new Subscribable(25.0) },
    depth: new Subscribable(8),
    width: 40,
    height: 30,
  };

  renderer.setClearColor(parameters.color.value);
  parameters.color.subscribeOnChange((v) => {
    renderer.setClearColor(v);
  });

  addSubscribableColor(gui, parameters.color, "color");
  addSubscribable(gui, parameters.depth, "depth", 5, 30);
  const visibilityGui = gui.addFolder("visibility");
  addSubscribable(visibilityGui, parameters.visibility.min, "min", 0, 10);
  addSubscribable(visibilityGui, parameters.visibility.max, "max", 10, 50);

  addBottom(parameters, scene, gui.addFolder("bottom"), time);
  addSurface(parameters, scene, gui.addFolder("surface"), time);
  addTurtle(parameters, scene, gui.addFolder("turtle"), time);
}
