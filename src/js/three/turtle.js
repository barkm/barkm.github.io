import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as UTILS from "../utils";
import * as MOTION from "../motion/motion";
import * as THREE_MOTION from "./motion";

import turtleModel from "../../../models/turtle.glb";

export class Turtle {
  constructor(group, material, motion) {
    this.group = group;
    this.material = material;
    this.material.skinning = true;
    this.motion = motion;
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
        UTILS.randomUniform(-2.5, 2.5),
        UTILS.randomUniform(-2.5, 2.5),
        UTILS.randomUniform(-2.5, 2.5)
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
    const initialRotations = THREE_MOTION.getInitialRotations(this.model);
    let gains = { rotation: 0.5, rotationVelocity: 2 };
    gains = { yaw: gains, pitch: gains };
    const motionCallback = MOTION.getMotionCallback(
      this.model.position.clone(),
      initialRotations,
      this.motion,
      gains
    );
    this.swimCallback = (time) => {
      const rotation = motionCallback(time);
      THREE_MOTION.updateObject(
        this.model,
        rotation.position,
        rotation.yaw,
        rotation.pitch
      );
    };
  }
}
