import * as THREE from "three";

import { Time } from "../three/utils";

import { addBottom } from "./bottom";
import { addSurface } from "./surface";
import { addTurtle } from "./turtle";

export interface SeaParameters {
  seaColor: string;
  visibility: {
    min: number;
    max: number;
  };
}

export function addSea(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  gui: dat.GUI
): (time: Time) => void {
  const parameters: SeaParameters = {
    seaColor: "#ffffff",
    visibility: { min: 5.0, max: 30.0 },
  };

  gui.addColor(parameters, "seaColor");
  const visibilityGui = gui.addFolder("visibility");
  visibilityGui.add(parameters.visibility, "min").min(0).max(10);
  visibilityGui.add(parameters.visibility, "max").min(10).max(50);

  const updateBottom = addBottom(parameters, scene, gui.addFolder("bottom"));
  const updateSurface = addSurface(parameters, scene, gui.addFolder("surface"));
  const updateTurtle = addTurtle(parameters, scene, gui.addFolder("turtle"));
  return (time: Time): void => {
    renderer.setClearColor(parameters.seaColor);
    updateBottom(time);
    updateSurface(time);
    updateTurtle(time);
  };
}
