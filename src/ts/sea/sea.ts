import * as THREE from "three";

import { Time } from "../three/utils";

import { addBottom } from "./bottom";
import { addSurface } from "./surface";
import { addSwimmingTurtle } from "./turtle";

export function addSea(scene: THREE.Scene, gui: dat.GUI): (time: Time) => void {
  const updateBottom = addBottom(scene);
  const updateSurface = addSurface(scene, gui);
  const turtle = addSwimmingTurtle(scene, gui);
  return (time: Time): void => {
    updateBottom(time);
    updateSurface(time);
    turtle.update(time);
  };
}
