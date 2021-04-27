import { modulo } from "../utils";
import * as THREE from "three";

class RotationController {
  constructor(
    startRotation,
    getTargetRotation,
    rotationGain,
    rotationVelocityGain
  ) {
    this.startRotation = startRotation;
    this.getTargetRotation = getTargetRotation;
    this.rotationGain = rotationGain;
    this.rotationVelocityGain = rotationVelocityGain;

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
    this.target.rotation = this.getTargetRotation(time, this.state);

    let errorRotation = modulo(
      this.target.rotation - this.state.rotation,
      2 * Math.PI
    );
    if (errorRotation > Math.PI) {
      errorRotation = errorRotation - 2 * Math.PI;
    }

    const errorRotationVelocity =
      this.target.rotationVelocity - this.state.rotationVelocity;

    const inputRotation = this.rotationGain * errorRotation;
    const inputRotationVelocity =
      this.rotationVelocityGain * errorRotationVelocity;

    this.state.rotationVelocity +=
      time.deltaTime * (inputRotation + inputRotationVelocity);
    this.state.rotation += time.deltaTime * this.state.rotationVelocity;
  }
}

function getUpdateObject(object3d) {
  return (time, xRotation, yRotation) => {
    object3d.setRotationFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yRotation.rotation
    );
    object3d.rotateX(xRotation.rotation);
    object3d.rotateZ(-yRotation.rotationVelocity);

    const direction = new THREE.Vector3();
    object3d.getWorldDirection(direction);
    object3d.position.add(direction.multiplyScalar(time.deltaTime));
  };
}

function getStayWithinRegionMotion(
  object3d,
  isOutSideXZ,
  getCenterXZ,
  signedDistanceOutsideY
) {
  const getTargetYaw = (time, state) => {
    if (isOutSideXZ()) {
      const origin = getCenterXZ();
      const deltaX = origin.x - object3d.position.x;
      const deltaZ = origin.z - object3d.position.z;
      return Math.atan2(deltaX, deltaZ);
    }
    return state.rotation;
  };
  const getTargetPitch = (time, state) => {
    const distance = signedDistanceOutsideY();
    if (Math.abs(distance) > 0) {
      return THREE.MathUtils.clamp(2 * distance, -Math.PI / 2, Math.PI / 2);
    }
    return state.rotation;
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

export function getMotionCallback(
  object3d,
  motion,
  rotationGain = 0.5,
  rotationVelocityGain = 2
) {
  let direction = new THREE.Vector3();
  object3d.getWorldDirection(direction);
  const startYRotation = Math.atan2(direction.x, direction.z);
  const startXRotation = Math.asin(-direction.y / direction.length());

  const yawController = new RotationController(
    startYRotation,
    motion.getTargetYaw,
    rotationGain,
    rotationVelocityGain
  );
  const pitchController = new RotationController(
    startXRotation,
    motion.getTargetPitch,
    rotationGain,
    rotationVelocityGain
  );

  const updateObject = getUpdateObject(object3d);

  return (time) => {
    pitchController.update(time);
    yawController.update(time);
    updateObject(time, pitchController.state, yawController.state);
  };
}
