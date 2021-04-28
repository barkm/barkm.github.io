import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import * as UTILS from "./js/utils";
import * as THREE_UTILS from "./js/three/utils";
import { Turtle } from "./js/three/models";

const gui = new dat.GUI();
gui.closed = true;

const scene = new THREE.Scene();

const turtleMaterialParameters = { color: 0x4d46cf, wireframe: true };
const turtleMaterial = new THREE.MeshBasicMaterial(turtleMaterialParameters);
const turtleGui = gui.addFolder("turtle");
turtleGui.add(turtleMaterial, "wireframe");
turtleGui.addColor(turtleMaterialParameters, "color").onChange(() => {
  turtleMaterial.color.set(turtleMaterialParameters.color);
});

const numTurtles = 10;
const turtles = [];
for (let i = 0; i < numTurtles; i++) {
  turtles.push(
    new Turtle(
      scene,
      turtleMaterial,
      turtleGui.addFolder("turtle" + i.toString())
    )
  );
}

const windowSizes = UTILS.getWindowSizes();

const camera = THREE_UTILS.getPerspectiveCamera(
  { fov: 60, near: 1, far: 50 },
  windowSizes
);
camera.position.set(0, 0, 15);

const cameraHelper = THREE_UTILS.getFixedCameraHelper(camera);
THREE_UTILS.addVisibilityToggle(gui, cameraHelper, scene, "cameraHelper");

const renderer = THREE_UTILS.getRenderer(
  document.querySelector("canvas"),
  windowSizes
);
renderer.setClearColor(0xffffff);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
gui
  .add(controls, "enabled")
  .name("controls")
  .onChange(() => {
    if (!controls.enabled) controls.reset();
  });

const axesHelper = new THREE.AxesHelper();
THREE_UTILS.addVisibilityToggle(gui, axesHelper, scene, "axesHelper");

const update = THREE_UTILS.getUpdateFunction([
  () => {
    renderer.render(scene, camera);
  },
  (time) => {
    turtles.map((turtle) => turtle.update(time));
  },
]);

update();
