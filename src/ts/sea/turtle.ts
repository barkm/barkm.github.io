import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";
import * as MOTION from "../motion/motion";
import { Turtle } from "../three/turtle";

import { SeaParameters } from "./sea";

export function addTurtle(
  parameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (time: THREE_UTILS.Time) => void {
  const turtleMaterialParameters = { color: 0x4d46cf, wireframe: true };
  const turtleMaterial = new THREE.MeshBasicMaterial(turtleMaterialParameters);
  gui.add(turtleMaterial, "wireframe");
  gui.addColor(turtleMaterialParameters, "color").onChange(() => {
    turtleMaterial.color.set(turtleMaterialParameters.color);
  });

  const box = new THREE.BoxGeometry(6, 2, 20);
  const mesh = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
  );
  mesh.position.y -= 3 + box.parameters.height / 2;
  THREE_UTILS.addVisibilityToggle(gui, mesh, scene, "boundary");
  const boxMotion = MOTION.getStayWithinBoxMotion(
    mesh.position,
    box.parameters
  );
  const perturbMotion = MOTION.perturbationMotion(
    { yaw: 0.5 * Math.PI, pitch: 0.25 * Math.PI },
    1
  );
  const motion = MOTION.chainMotions([perturbMotion, boxMotion]);

  const turtle = new Turtle(scene, mesh.position, turtleMaterial, motion);
  return (time) => {
    turtle.update(time);
  };
}
