import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";
import * as MOTION from "../motion/motion";
import { Turtle } from "../three/turtle";

export function addSwimmingTurtle(scene: THREE.Scene, gui: dat.GUI) {
  const turtleMaterialParameters = { color: 0x4d46cf, wireframe: true };
  const turtleMaterial = new THREE.MeshBasicMaterial(turtleMaterialParameters);
  const turtleGui = gui.addFolder("turtle");
  turtleGui.add(turtleMaterial, "wireframe");
  turtleGui.addColor(turtleMaterialParameters, "color").onChange(() => {
    turtleMaterial.color.set(turtleMaterialParameters.color);
  });

  const box = new THREE.BoxGeometry(6, 2, 20);
  const mesh = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
  );
  mesh.position.y -= 3 + box.parameters.height / 2;
  THREE_UTILS.addVisibilityToggle(turtleGui, mesh, scene, "boundary");
  const boxMotion = MOTION.getStayWithinBoxMotion(
    mesh.position,
    box.parameters
  );
  const perturbMotion = MOTION.perturbationMotion(
    { yaw: 0.5 * Math.PI, pitch: 0.25 * Math.PI },
    1
  );
  const motion = MOTION.chainMotions([perturbMotion, boxMotion]);

  return new Turtle(scene, mesh.position, turtleMaterial, motion);
}
