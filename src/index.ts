import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import * as UTILS from "./ts/utils";
import * as THREE_UTILS from "./ts/three/utils";
import { getSea } from "./ts/sea/sea";

const gui = new dat.GUI();
gui.hide();

const scene = new THREE.Scene();

const windowSize = UTILS.getWindowSize();

const camera = THREE_UTILS.getPerspectiveCamera(50, 1, 25, windowSize);

const cameraParameters = {
  radius: 10,
  period: 120,
  depth: {
    mean: 3,
    amplitude: 2,
  },
};

const rotateCamera = (t: THREE_UTILS.Time) => {
  const radius = cameraParameters.radius;
  const peroid = cameraParameters.period;
  camera.position.x = radius * Math.sin((2 * Math.PI * t.elapsed) / peroid);
  camera.position.y =
    -cameraParameters.depth.mean +
    cameraParameters.depth.amplitude *
      Math.sin((2 * Math.PI * t.elapsed) / peroid);
  camera.position.z = radius * Math.cos((2 * Math.PI * t.elapsed) / peroid);
  camera.lookAt(0, -cameraParameters.depth.mean, 0);
};

const cameraGui = gui.addFolder("camera");
cameraGui.add(cameraParameters, "radius").min(0).max(20);
cameraGui.add(cameraParameters, "period").min(0).max(240);
cameraGui.add(cameraParameters.depth, "mean").min(0).max(5);
cameraGui.add(cameraParameters.depth, "amplitude").min(0).max(5);

const cameraHelper = THREE_UTILS.getFixedCameraHelper(camera);
THREE_UTILS.addVisibilityToggle(gui, cameraHelper, scene, "cameraHelper");

const renderer = THREE_UTILS.getRenderer(windowSize);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
gui
  .add(controls, "enabled")
  .name("camera")
  .onChange(() => {
    if (!controls.enabled) controls.reset();
  });
controls.target.set(0, camera.position.y, 0);
controls.saveState();
controls.update();

const axesHelper = new THREE.AxesHelper();
THREE_UTILS.addVisibilityToggle(gui, axesHelper, scene, "axesHelper");

const animationLoop = THREE_UTILS.getAnimationLoop();

animationLoop.time.subscribeOnChange(rotateCamera);

const seaGui = gui.addFolder("sea");
const sea = getSea(camera.far, renderer, seaGui, animationLoop.time, false);
scene.add(sea);
THREE_UTILS.addVisibilityToggle(seaGui, sea, scene, "visible");

animationLoop.time.subscribeOnChange(() => renderer.render(scene, camera));

animationLoop.loop();
