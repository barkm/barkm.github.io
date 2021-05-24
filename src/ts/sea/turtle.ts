import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";
import * as MOTION from "../motion/motion";
import { Turtle } from "../three/turtle";

import { SeaParameters } from "./sea";

import vertexShader from "../../shaders/turtle/vertex.glsl";
import fragmentShader from "../../shaders/turtle/fragment.glsl";
import { Subscribable } from "../subscribable";

export function getTurtle(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<THREE_UTILS.Time>
) {
  const group = new THREE.Group();

  const box = new THREE.BoxGeometry(6, 2, 20);
  const mesh = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
  );
  mesh.position.z = -box.parameters.depth / 2;
  mesh.position.y -= 2 + box.parameters.height / 2;
  THREE_UTILS.addVisibilityToggle(gui, mesh, group, "boundary");
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
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
    },
    side: THREE.DoubleSide,
    alphaToCoverage: true,
    extensions: {
      derivatives: true,
    },
    precision: "mediump",
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

  seaParameters.color.subscribeOnChange((v) => {
    turtleMaterial.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribeOnChange((v) => {
    turtleMaterial.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribeOnChange((v) => {
    turtleMaterial.uniforms.uMaxVisibility.value = v;
  });

  const turtle = new Turtle(group, mesh.position, turtleMaterial, motion);

  time.subscribeOnChange((t) => turtle.update(t));

  return group;
}
