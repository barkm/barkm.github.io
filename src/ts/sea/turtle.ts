import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";
import * as MOTION from "../motion/motion";
import { Turtle } from "../three/turtle";

import { SeaParameters } from "./sea";

import vertexShader from "../../shaders/turtle/vertex.glsl";
import fragmentShader from "../../shaders/turtle/fragment.glsl";

export function addTurtle(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (time: THREE_UTILS.Time) => void {
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

  const parameters = { color: "#4d46cf", wireframe: true };
  const turtleMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(parameters.color) },
      uLineThickness: { value: 1.0 },
    },
    side: THREE.DoubleSide,
    alphaToCoverage: true,
    extensions: {
      derivatives: true,
    },
  });
  gui.addColor(parameters, "color").onChange(() => {
    turtleMaterial.uniforms.uColor.value.set(parameters.color);
  });
  gui
    .add(turtleMaterial.uniforms.uLineThickness, "value")
    .min(0)
    .max(2)
    .step(0.01)
    .name("lineThickness");

  const turtle = new Turtle(scene, mesh.position, turtleMaterial, motion);
  return (time) => {
    turtle.update(time);
  };
}
