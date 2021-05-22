import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as UTILS from "../utils";
import * as MOTION from "../motion/motion";
import * as THREE_UTILS from "./utils";
import { setBarycentricCoordinateAttribute } from "./barycentric";
import * as THREE_MOTION from "./motion";

import turtleModel from "../../../models/turtle.glb";
import { Motion } from "../motion/types";

export class Turtle {
  model?: THREE.Group;
  mixer?: THREE.AnimationMixer;
  swim?: (time: THREE_UTILS.Time) => void;

  constructor(
    public parent: THREE.Group | THREE.Scene,
    public position: THREE.Vector3,
    public material: THREE.ShaderMaterial,
    public motion: Motion
  ) {
    this.parent = parent;
    this.position = position;
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
          setBarycentricCoordinateAttribute(obj.geometry);
          obj.material = this.material;
        }
      });
      this.parent.add(gltf.scene);

      this.model.position.set(
        this.position.x,
        this.position.y,
        this.position.z
      );
      this.model.rotation.y = UTILS.randomUniform(0, 2 * Math.PI);
      this.model.rotateX(UTILS.randomUniform(-Math.PI / 4, Math.PI / 4));
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
      gains,
      0.8
    );
    this.swim = (time) => {
      if (time.delta > 1) {
        return;
      }
      const motionState = motionCallback(time);
      THREE_MOTION.updateObject(
        this.model!,
        motionState.position,
        motionState.rotations
      );
    };
  }
}
