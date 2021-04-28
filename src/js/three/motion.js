import { modulo } from "../utils";
import * as THREE from "three";

class RotationController {
  constructor(startRotation, getTarget, gains) {
    this.startRotation = startRotation;
    this.getTarget = getTarget;
    this.gains = gains;
    this.state = {
      rotation: startRotation,
      rotationVelocity: 0,
    };
    this.target = {
      rotation: 0,
      rotationVelocity: 0,
    };
  }
  update(time) {
    this.target = this.getTarget(time, this.state, this.target);

    let errorRotation = modulo(
      this.target.rotation - this.state.rotation,
      2 * Math.PI
    );
    if (errorRotation > Math.PI) {
      errorRotation = errorRotation - 2 * Math.PI;
    }

    const errorRotationVelocity =
      this.target.rotationVelocity - this.state.rotationVelocity;

    const inputRotation = this.gains.rotation * errorRotation;
    const inputRotationVelocity =
      this.gains.rotationVelocity * errorRotationVelocity;

    this.state.rotationVelocity +=
      time.deltaTime * (inputRotation + inputRotationVelocity);
    this.state.rotation += time.deltaTime * this.state.rotationVelocity;
  }
}

function getUpdateObject(object3d) {
  return (time, speed, xRotation, yRotation) => {
    object3d.setRotationFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yRotation.rotation
    );
    object3d.rotateX(xRotation.rotation);
    object3d.rotateZ(-yRotation.rotationVelocity);

    const direction = new THREE.Vector3();
    object3d.getWorldDirection(direction);
    object3d.position.add(direction.multiplyScalar(speed * time.deltaTime));
  };
}

function getStayWithinRegionMotion(
  object3d,
  isOutSideXZ,
  getCenterXZ,
  signedDistanceOutsideY
) {
  const getTargetYaw = (time, state, target) => {
    let rotation = state.rotation;
    if (isOutSideXZ()) {
      const origin = getCenterXZ();
      const deltaX = origin.x - object3d.position.x;
      const deltaZ = origin.z - object3d.position.z;
      rotation = Math.atan2(deltaX, deltaZ);
    }
    return {
      rotation: rotation,
      rotationVelocity: 0,
    };
  };
  const getTargetPitch = (time, state, target) => {
    let rotation = state.rotation;
    const distance = signedDistanceOutsideY();
    if (Math.abs(distance) > 0) {
      rotation = THREE.MathUtils.clamp(2 * distance, -Math.PI / 2, Math.PI / 2);
    }
    return {
      rotation: rotation,
      rotationVelocity: 0,
    };
  };
  return {
    getTargetYaw,
    getTargetPitch,
  };
}

export function getStayWithinBoxMotion(object3d, center, sides) {
  const isOutsideXZ = () => {
    return (
      Math.abs(object3d.position.x) > sides.width / 2 ||
      Math.abs(object3d.position.z) > sides.depth / 2
    );
  };
  const getCenterXZ = () => {
    return { x: center.x, z: center.z };
  };
  const signedDistanceOutsideY = () => {
    const distance = object3d.position.y - center.y;
    if (Math.abs(distance) > sides.height / 2) {
      return distance - (sides.height / 2) * Math.sign(object3d.position.y);
    }
    return 0;
  };
  return getStayWithinRegionMotion(
    object3d,
    isOutsideXZ,
    getCenterXZ,
    signedDistanceOutsideY
  );
}

export function getMotionCallback(object3d, motion, gains, gui) {
  let direction = new THREE.Vector3();
  object3d.getWorldDirection(direction);
  const startYRotation = Math.atan2(direction.x, direction.z);
  const startXRotation = Math.asin(-direction.y / direction.length());

  const yawController = new RotationController(
    startYRotation,
    motion.getTargetYaw,
    gains
  );
  const pitchController = new RotationController(
    startXRotation,
    motion.getTargetPitch,
    gains
  );

  const parameters = {
    speed: 1,
  };

  if (gui) {
    gui.add(parameters, "speed").min(0).max(5);
    const gainsFolder = gui.addFolder("gains");
    gainsFolder.add(gains, "rotation").min(0).max(5);
    gainsFolder.add(gains, "rotationVelocity").min(0).max(5);
  }

  const updateObject = getUpdateObject(object3d);

  return (time) => {
    pitchController.update(time);
    yawController.update(time);
    updateObject(
      time,
      parameters.speed,
      pitchController.state,
      yawController.state
    );
  };
}
