import "./style.css";
import * as THREE from "three";
import * as UTILS from "./js/utils";
import * as THREE_UTILS from "./js/three/utils";
import { addTurtle } from "./js/three/models";
import * as MOTION from "./js/three/motion";

const scene = new THREE.Scene();

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const turtle = addTurtle(scene);

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
renderer.render(scene, camera);

let motion_callback = null;

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
    if (!motion_callback) {
      turtle.group.rotation.y = UTILS.randomUniform(0, 2 * Math.PI);
      turtle.group.rotateOnAxis(
        new THREE.Vector3(1, 0, 0),
        UTILS.randomUniform(-Math.PI / 2, Math.PI / 2)
      );

      const motion = MOTION.getStayWithinBoxMotion(
        turtle.group,
        { x: 0, y: 0, z: 0 },
        { width: 5, height: 5, depth: 5 }
      );
      motion_callback = MOTION.getMotionCallback(turtle.group, motion);
    }
    motion_callback(time);
  },
]);

update();
