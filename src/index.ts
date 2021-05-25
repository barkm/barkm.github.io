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
camera.position.set(0, -3, 0);

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
controls.target.set(0, camera.position.y, -10);
controls.saveState();
controls.update();

const axesHelper = new THREE.AxesHelper();
THREE_UTILS.addVisibilityToggle(gui, axesHelper, scene, "axesHelper");

const animationLoop = THREE_UTILS.getAnimationLoop();

const seaGui = gui.addFolder("sea");
const sea = getSea(camera.far, renderer, seaGui, animationLoop.time);
scene.add(sea);
THREE_UTILS.addVisibilityToggle(seaGui, sea, scene, "visible");

animationLoop.time.subscribeOnChange(() => renderer.render(scene, camera));

animationLoop.loop();
