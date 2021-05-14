import * as THREE from "three";

import { Subscribable } from "../utils";
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
}

export function addSea(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  gui: dat.GUI
): (time: Time) => void {
  const parameters: SeaParameters = {
    color: new Subscribable("#7696ff"),
    visibility: { min: new Subscribable(5.0), max: new Subscribable(30.0) },
    depth: new Subscribable(8),
  };

  renderer.setClearColor(parameters.color.value);
  parameters.color.subscribe((v) => {
    renderer.setClearColor(v);
  });

  gui.addColor(parameters.color, "value").name("color");
  gui.add(parameters.depth, "value").min(5).max(15).name("depth");
  const visibilityGui = gui.addFolder("visibility");
  visibilityGui
    .add(parameters.visibility.min, "value")
    .min(0)
    .max(10)
    .name("min");
  visibilityGui
    .add(parameters.visibility.max, "value")
    .min(10)
    .max(50)
    .name("max");

  const updateBottom = addBottom(parameters, scene, gui.addFolder("bottom"));
  const updateSurface = addSurface(parameters, scene, gui.addFolder("surface"));
  const updateTurtle = addTurtle(parameters, scene, gui.addFolder("turtle"));
  return (time: Time): void => {
    updateBottom(time);
    updateSurface(time);
    updateTurtle(time);
  };
}
