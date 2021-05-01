import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as UTILS from "../utils";
import * as MOTION from "../motion/motion";
import * as THREE_UTILS from "./utils";
import * as THREE_MOTION from "./motion";

import turtleModel from "../../../models/turtle.glb";
import { Motion } from "../motion/types";

export class Turtle {
  groupOrScene: THREE_UTILS.GroupOrScene;
  material: THREE.MeshBasicMaterial;
  model?: THREE.Group;
  mixer?: THREE.AnimationMixer;
  motion: Motion;
  swim?: (time: THREE_UTILS.Time) => void;

  constructor(
    groupOrScene: THREE_UTILS.GroupOrScene,
    material: THREE.MeshBasicMaterial,
    motion: Motion
  ) {
    this.groupOrScene = groupOrScene;
    this.material = material;
    this.material.skinning = true;
    this.motion = motion;
    this.load();
  }

  load() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(turtleModel, (gltf) => {
      this.model = gltf.scene;
      this.mixer = new THREE.AnimationMixer(gltf.scene);
      this.mixer.clipAction(gltf.animations[1]).play();
      gltf.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material = this.material;
        }
      });
      this.groupOrScene.add(gltf.scene);

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

  update(time: THREE_UTILS.Time) {
    if (this.mixer) {
      this.mixer.update(time.delta);
    }
    if (this.swim) {
      this.swim(time);
    }
  }

  setupSwimming() {
    const initialRotations = THREE_MOTION.getInitialRotations(this.model!);
    const gain = { rotation: 0.5, rotationVelocity: 2 };
    const gains = { yaw: gain, pitch: gain };
    const motionCallback = MOTION.getMotionCallback(
      this.model!.position.clone(),
      initialRotations,
      this.motion,
      gains
    );
    this.swim = (time) => {
      const motionState = motionCallback(time);
      THREE_MOTION.updateObject(
        this.model!,
        motionState.position,
        motionState.rotations
      );
    };
  }
}
