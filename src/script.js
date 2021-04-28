import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import * as UTILS from "./js/utils";
import * as THREE_UTILS from "./js/three/utils";
import { addTurtle } from "./js/three/models";
import * as THREE_MOTION from "./js/three/motion";
import * as MOTION from "./js/motion/motion";

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
const turtle = addTurtle(scene, turtleMaterial);

const windowSizes = UTILS.getWindowSizes();

const camera = THREE_UTILS.getPerspectiveCamera(
  { fov: 60, near: 1, far: 50 },
  windowSizes
);
camera.position.set(0, 0, 10);

const renderer = THREE_UTILS.getRenderer(
  document.querySelector("canvas"),
  windowSizes
);
renderer.setClearColor(0xffffff);
renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
gui
  .add(controls, "enabled")
  .name("controls")
  .onChange(() => {
    if (!controls.enabled) controls.reset();
  });

const axesHelper = new THREE.AxesHelper();
THREE_UTILS.addVisibilityToggle(gui, axesHelper, scene, "axes helper");

let motionCallback = null;

const update = THREE_UTILS.getUpdateFunction([
  () => {
    renderer.render(scene, camera);
  },
  (time) => {
    if (turtle.mixer) turtle.mixer.update(time.deltaTime);
  },
  (time) => {
    if (!turtle.group) {
      return;
    }
    if (!motionCallback) {
      turtle.group.rotation.y = UTILS.randomUniform(0, 2 * Math.PI);
      turtle.group.rotateOnAxis(
        new THREE.Vector3(1, 0, 0),
        UTILS.randomUniform(-Math.PI / 2, Math.PI / 2)
      );

      const turtleBox = new THREE.BoxGeometry(5, 5, 5);
      const turtleBoxMesh = new THREE.Mesh(
        turtleBox,
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
      );
      THREE_UTILS.addVisibilityToggle(
        turtleGui,
        turtleBoxMesh,
        scene,
        "boundary"
      );

      const motion = MOTION.getStayWithinBoxMotion(
        turtle.group.position,
        { x: 0, y: 0, z: 0 },
        turtleBox.parameters
      );

      const initialRotations = THREE_MOTION.getInitialRotations(turtle.group);
      const gains = { rotation: 0.5, rotationVelocity: 2 };
      motionCallback = MOTION.getMotionCallback(
        initialRotations,
        motion,
        { yaw: gains, pitch: gains },
        turtleGui.addFolder("motion")
      );
    }
    const rotation = motionCallback(time);
    THREE_MOTION.updateObject(
      turtle.group,
      time,
      1,
      rotation.yaw,
      rotation.pitch
    );
  },
]);

update();
