import * as THREE from "three";

import {
  Subscribable,
  addSubscribable,
  addSubscribableColor,
} from "../subscribable";
import { addVisibilityToggle, Time } from "../three/utils";

import { getBottom } from "./bottom/bottom";
import { getSurface } from "./surface";
import { getTurtle } from "./turtle";

export interface SeaParameters {
  color: Subscribable<THREE.Color>;
  visibility: {
    min: Subscribable<number>;
    max: Subscribable<number>;
  };
  depth: Subscribable<number>;
  width: number;
  height: number;
}

export function getSea(
  parameters: SeaParameters,
  renderer: THREE.WebGLRenderer,
  gui: dat.GUI,
  time: Subscribable<Time>,
  isDay: Subscribable<number>
) {
  renderer.setClearColor(parameters.color.value);
  parameters.color.subscribeOnChange((v) => {
    renderer.setClearColor(v);
  });

  addSubscribableColor(gui, parameters.color, "color");
  addSubscribable(gui, parameters.depth, "depth", 5, 30);
  const visibilityGui = gui.addFolder("visibility");
  addSubscribable(visibilityGui, parameters.visibility.min, "min", 0, 10);
  addSubscribable(visibilityGui, parameters.visibility.max, "max", 10, 50);

  const sea = new THREE.Group();

  const bottomGui = gui.addFolder("bottom");
  const bottom = getBottom(parameters, bottomGui, time, isDay);
  sea.add(bottom);
  addVisibilityToggle(bottomGui, bottom, sea, "visible");

  const surfaceGui = gui.addFolder("surface");
  const surface = getSurface(parameters, surfaceGui, time, isDay);
  sea.add(surface);
  addVisibilityToggle(surfaceGui, surface, sea, "visible");

  const turtleGui = gui.addFolder("turtle");
  const turtle = getTurtle(parameters, turtleGui, time, isDay);
  sea.add(turtle);
  addVisibilityToggle(turtleGui, turtle, sea, "visible");

  return sea;
}
