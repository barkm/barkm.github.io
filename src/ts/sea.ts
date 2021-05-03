import * as THREE from "three";

import * as THREE_UTILS from "./three/utils";
import * as MOTION from "./motion/motion";
import { Turtle } from "./three/turtle";

import surfaceVertexShader from "../shaders/surface/vertex.glsl";
import surfaceFragmentShader from "../shaders/surface/fragment.glsl";

function getSurface(geometry: THREE.PlaneGeometry) {
  const material = new THREE.ShaderMaterial({
    vertexShader: surfaceVertexShader,
    fragmentShader: surfaceFragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  const surface = new THREE.Mesh(geometry, material);
  surface.position.z = -15;
  surface.rotation.x = -Math.PI / 2;
  return surface;
}

export function addSurface(
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const surfaceGeometry = new THREE.PlaneGeometry(40, 50, 64, 64);

  const surfaceBackground = getSurface(surfaceGeometry);
  surfaceBackground.material.uniforms.uColor = {
    value: new THREE.Color("#ffffff"),
  };
  surfaceBackground.position.y += 0.05;
  scene.add(surfaceBackground);

  const surfaceForeGround = getSurface(surfaceGeometry);
  surfaceForeGround.material.wireframe = true;
  surfaceForeGround.material.uniforms.uColor = {
    value: new THREE.Color("#0000ff"),
  };
  scene.add(surfaceForeGround);

  return (time) => {
    surfaceBackground.material.uniforms.uTime.value = time.elapsed;
    surfaceForeGround.material.uniforms.uTime.value = time.elapsed;
  };
}

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
