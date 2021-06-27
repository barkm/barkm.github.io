import "./style.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import Stats from "stats.js";

import * as UTILS from "./ts/utils";
import * as THREE_UTILS from "./ts/three/utils";
import { getSea } from "./ts/sea/sea";
import {
  addDayNightToggle,
  ColorParameters,
  DayNightParameters,
} from "./ts/day_night";
import { Subscribable } from "./ts/subscribable";

const gui = new dat.GUI();
gui.hide();

const stats = new Stats();
stats.showPanel(0);
const child = document.body.appendChild(stats.dom);
const statsDebug = {
  toggleStats: () => {
    child.style.display = child.style.display == "none" ? "block" : "none";
  },
};
statsDebug.toggleStats();
gui.add(statsDebug, "toggleStats");

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

const animationLoop = THREE_UTILS.getAnimationLoop(
  () => stats.begin(),
  () => stats.end()
);

animationLoop.time.subscribeOnChange(rotateCamera);

const isDay = UTILS.isLightMode();

const parameters = {
  color: new Subscribable(isDay.value ? "#7696ff" : "#061222"),
  visibility: { min: new Subscribable(5.0), max: new Subscribable(20.0) },
  depth: new Subscribable(8),
  width: camera.far + 5,
  height: camera.far + 5,
};
isDay.subscribeOnFinishChange((d: boolean) => {
  parameters.color.value = d ? "#7696ff" : "#061222";
  parameters.color.callSubscribers();
});

const seaGui = gui.addFolder("sea");
const sea = getSea(parameters, renderer, seaGui, animationLoop.time, isDay);
scene.add(sea);
THREE_UTILS.addVisibilityToggle(seaGui, sea, scene, "visible");

animationLoop.time.subscribeOnChange(() => renderer.render(scene, camera));

animationLoop.loop();

const dayParameters: ColorParameters = {
  background: "#ffffff",
  icon: "#061222",
};
const nightParameters: ColorParameters = {
  background: "#061222",
  icon: "#ffffff",
};
const dayNightParameters: DayNightParameters = {
  day: dayParameters,
  night: nightParameters,
};
addDayNightToggle(isDay, dayNightParameters);
