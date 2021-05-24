import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";

import * as UTILS from "../utils";
import { Subscribable } from "../subscribable";

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
  parent: THREE.Group | THREE.Scene,
  name: string
): void {
  const toggle = () => {
    if (object3d.parent == parent) {
      parent.remove(object3d);
    } else {
      parent.add(object3d);
    }
  };
  gui
    .add({ show: object3d.parent == parent }, "show")
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
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
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

export function getAnimationLoop(): {
  time: Subscribable<Time>;
  loop: () => void;
} {
  let time = new Subscribable({ elapsed: 0, delta: 0 });
  const clock = new THREE.Clock();
  const update = () => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    time.value = { elapsed, delta };
    time.callSubscribers();
    window.requestAnimationFrame(update);
  };
  return {
    time,
    loop: update,
  };
}

export interface GltfModel {
  scene: THREE.Group;
}

export function loadModel(
  loader: GLTFLoader,
  path: string
): Promise<GltfModel> {
  return new Promise((resolve) => {
    loader.load(path, resolve);
  });
}

export function removeGroup(group: THREE.Group): void {
  const toRemove: Array<THREE.Mesh | THREE.Points> = [];
  group.traverse((obj) => {
    if (obj instanceof THREE.Group && obj != group) {
      removeGroup(obj);
    }
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((mesh) => group.remove(mesh));
}

export function getBoundingBoxFromBufferGeometry(
  geometry: THREE.BufferGeometry
) {
  const positionAttribute = geometry.getAttribute(
    "position"
  ) as THREE.BufferAttribute;
  return new THREE.Box3().setFromBufferAttribute(positionAttribute);
}

export function setColorAttribute(
  geometry: THREE.BufferGeometry,
  color: THREE.Color
) {
  const colors = new Float32Array(3 * geometry.getAttribute("position").count);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
}
