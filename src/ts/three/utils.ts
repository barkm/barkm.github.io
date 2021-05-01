import * as THREE from "three";
import * as dat from "dat.gui";

import * as UTILS from "../utils";

export type GroupOrScene = THREE.Group | THREE.Scene;

export function getPerspectiveCamera(
  fov: number,
  near: number,
  far: number,
  windowSize: UTILS.WindowSize
): THREE.Camera {
  const camera = new THREE.PerspectiveCamera(
    fov,
    windowSize.width / windowSize.height,
    near,
    far
  );
  window.addEventListener("resize", () => {
    camera.aspect = windowSize.width / windowSize.height;
    camera.updateProjectionMatrix();
  });
  return camera;
}

export function getFixedCameraHelper(camera: THREE.Camera): THREE.CameraHelper {
  const cameraHelper = new THREE.CameraHelper(camera);
  cameraHelper.matrixAutoUpdate = true;
  cameraHelper.position.set(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
  return cameraHelper;
}

export function addVisibilityToggle(
  gui: dat.GUI,
  object3d: THREE.Object3D,
  groupOrScene: GroupOrScene,
  name: string
): void {
  const toggle = () => {
    if (object3d.parent == groupOrScene) {
      groupOrScene.remove(object3d);
    } else {
      groupOrScene.add(object3d);
    }
  };
  gui
    .add({ show: object3d.parent == groupOrScene }, "show")
    .name(name)
    .onChange(toggle);
}

export function getRenderer(windowSize: UTILS.WindowSize): THREE.WebGLRenderer {
  let canvas = document.querySelector("canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "webgl";
    document.body.appendChild(canvas);
  }
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(windowSize.width, windowSize.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  window.addEventListener("resize", () => {
    renderer.setSize(windowSize.width, windowSize.height);
  });
  return renderer;
}

export interface Time {
  elapsed: number;
  delta: number;
}

export function getUpdate(updateFunctions: Array<(time: Time) => any>) {
  const clock = new THREE.Clock();
  let previousTime = 0;
  const update = () => {
    const elapsed = clock.getElapsedTime();
    const delta = elapsed - previousTime;
    previousTime = elapsed;
    if (updateFunctions) {
      updateFunctions.map((f) => {
        f({ elapsed, delta });
      });
    }
    window.requestAnimationFrame(update);
  };
  return update;
}
