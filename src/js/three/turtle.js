import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as UTILS from "../utils";
import * as MOTION from "../motion/motion";
import * as THREE_UTILS from "./utils";
import * as THREE_MOTION from "./motion";

import turtleModel from "../../../models/turtle.glb";

export class Turtle {
  constructor(group, material, gui) {
    this.group = group;
    this.material = material;
    this.material.skinning = true;
    this.gui = gui;
    this.model = null;
    this.mixer = null;
    this.swimCallback = null;
    this.load();
  }

  load() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(turtleModel, (gltf) => {
      this.model = gltf.scene;
      this.mixer = new THREE.AnimationMixer(gltf.scene);
      this.mixer.clipAction(gltf.animations[1]).play();
      gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.material;
        }
      });
      this.group.add(gltf.scene);

      this.model.position.set(
        UTILS.randomUniform(-5, 5),
        UTILS.randomUniform(-5, 5),
        UTILS.randomUniform(-10, 10)
      );
      this.model.rotation.y = UTILS.randomUniform(0, 2 * Math.PI);
      this.model.rotateX(UTILS.randomUniform(-Math.PI / 2, Math.PI / 2));
      this.setupSwimming();
    });
  }

  update(time) {
    this.animate(time);
    this.swim(time);
  }

  animate(time) {
    if (this.mixer) {
      this.mixer.update(time.deltaTime);
    }
  }

  swim(time) {
    if (this.swimCallback) {
      this.swimCallback(time);
    }
  }

  setupSwimming() {
    const box = new THREE.BoxGeometry(10, 10, 20);
    const mesh = new THREE.Mesh(
      box,
      new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    THREE_UTILS.addVisibilityToggle(this.gui, mesh, this.group, "boundary");

    const motion = MOTION.getStayWithinBoxMotion(
      this.model.position,
      mesh.position,
      box.parameters
    );

    const initialRotations = THREE_MOTION.getInitialRotations(this.model);
    const gains = { rotation: 0.5, rotationVelocity: 2 };
    const motionCallback = MOTION.getMotionCallback(
      initialRotations,
      motion,
      { yaw: gains, pitch: gains },
      this.gui.addFolder("motion")
    );

    this.swimCallback = (time) => {
      const rotation = motionCallback(time);
      THREE_MOTION.updateObject(
        this.model,
        time,
        1,
        rotation.yaw,
        rotation.pitch
      );
    };
  }
}
