import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import * as UTILS from "./ts/utils";
import * as THREE_UTILS from "./ts/three/utils";
import * as MOTION from "./ts/motion/motion";
import { Turtle } from "./ts/three/turtle";

const gui = new dat.GUI();
gui.hide();

const scene = new THREE.Scene();

const windowSize = UTILS.getWindowSize();

const camera = THREE_UTILS.getPerspectiveCamera(60, 1, 50, windowSize);
camera.position.set(0, 0, 10);

const cameraHelper = THREE_UTILS.getFixedCameraHelper(camera);
THREE_UTILS.addVisibilityToggle(gui, cameraHelper, scene, "cameraHelper");

const renderer = THREE_UTILS.getRenderer(windowSize);
renderer.setClearColor(0xffffff);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
gui
  .add(controls, "enabled")
  .name("camera")
  .onChange(() => {
    if (!controls.enabled) controls.reset();
  });

const axesHelper = new THREE.AxesHelper();
THREE_UTILS.addVisibilityToggle(gui, axesHelper, scene, "axesHelper");

const turtleMaterialParameters = { color: 0x4d46cf, wireframe: true };
const turtleMaterial = new THREE.MeshBasicMaterial(turtleMaterialParameters);
const turtleGui = gui.addFolder("turtle");
turtleGui.add(turtleMaterial, "wireframe");
turtleGui.addColor(turtleMaterialParameters, "color").onChange(() => {
  turtleMaterial.color.set(turtleMaterialParameters.color);
});

const box = new THREE.BoxGeometry(7, 7, 7);
const mesh = new THREE.Mesh(
  box,
  new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
);
THREE_UTILS.addVisibilityToggle(turtleGui, mesh, scene, "boundary");
const boxMotion = MOTION.getStayWithinBoxMotion(mesh.position, box.parameters);
const perturbMotion = MOTION.perturbationMotion(
  { yaw: 0.5 * Math.PI, pitch: 0.25 * Math.PI },
  1
);
const motion = MOTION.chainMotions([perturbMotion, boxMotion]);

const turtle = new Turtle(scene, turtleMaterial, motion);

const update = THREE_UTILS.getUpdate([
  () => {
    renderer.render(scene, camera);
  },
  (time) => {
    turtle.update(time);
  },
]);

update();
