import * as THREE from "three";

export function getPerspectiveCamera(properties, sizes) {
  const camera = new THREE.PerspectiveCamera(
    properties.fov,
    sizes.width / sizes.height,
    properties.near,
    properties.far
  );
  window.addEventListener("resize", () => {
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
  });
  return camera;
}

export function getFixedCameraHelper(camera) {
  const cameraHelper = new THREE.CameraHelper(camera);
  cameraHelper.matrixAutoUpdate = true;
  cameraHelper.position.set(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
  return cameraHelper;
}

export function addVisibilityToggle(gui, object3d, scene, name) {
  const toggle = () => {
    if (object3d.parent == scene) {
      scene.remove(object3d);
    } else {
      scene.add(object3d);
    }
  };
  gui
    .add({ show: object3d.parent == scene }, "show")
    .name(name)
    .onChange(toggle);
}

export function getRenderer(canvas, sizes) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  window.addEventListener("resize", () => {
    renderer.setSize(sizes.width, sizes.height);
  });
  return renderer;
}

export function getUpdateFunction(updateFunctions) {
  const clock = new THREE.Clock();
  let previousTime = 0;
  const update = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    if (updateFunctions) {
      updateFunctions.map((f) => {
        f({ elapsedTime, deltaTime });
      });
    }
    window.requestAnimationFrame(update);
  };
  return update;
}
