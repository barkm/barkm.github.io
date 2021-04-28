import { modulo } from "../utils";
import * as THREE from "three";

class RotationController {
  constructor(initialState, getTarget, gains) {
    this.getTarget = getTarget;
    this.state = initialState;
    this.target = null;
    this.gains = gains;
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

function getStayWithinAreaYaw(object3d, isOutSideXZ, getCenterXZ) {
  return (time, state, target) => {
    if (isOutSideXZ()) {
      const origin = getCenterXZ();
      const deltaX = origin.x - object3d.position.x;
      const deltaZ = origin.z - object3d.position.z;
      return {
        rotation: Math.atan2(deltaX, deltaZ),
        rotationVelocity: target.rotationVelocity,
      };
    }
    return target;
  };
}

function getStayWithinYPitch(signedDistanceOutsideY) {
  return (time, state, target) => {
    const distance = signedDistanceOutsideY();
    if (Math.abs(distance) > 0) {
      return {
        rotation: THREE.MathUtils.clamp(
          2 * distance,
          -Math.PI / 2,
          Math.PI / 2
        ),
        rotationVelocity: target.rotationVelocity,
      };
    }
    return target;
  };
}

function getStayWithinRegionMotion(
  object3d,
  isOutSideXZ,
  getCenterXZ,
  signedDistanceOutsideY
) {
  return {
    getYaw: getStayWithinAreaYaw(object3d, isOutSideXZ, getCenterXZ),
    getPitch: getStayWithinYPitch(signedDistanceOutsideY),
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

export function noRotationVelocityMotion() {
  const noRotationVelocity = (time, state, target) => {
    return { rotation: state.rotation, rotationVelocity: 0 };
  };
  return {
    getYaw: noRotationVelocity,
    getPitch: noRotationVelocity,
  };
}

export function identityMotion() {
  const identityMotion = (time, state, target) => state;
  return {
    getYaw: identityMotion,
    getPitch: identityMotion,
  };
}

function chainTargetFunctions(targetFunctions) {
  return (time, state, target) => {
    const chainer = (reducedTarget, motion) =>
      motion(time, state, reducedTarget);
    return targetFunctions.reduce(chainer, target);
  };
}

export function chainMotions(motions) {
  return {
    getYaw: chainTargetFunctions(motions.map((motion) => motion.getYaw)),
    getPitch: chainTargetFunctions(motions.map((motion) => motion.getPitch)),
  };
}

export function getMotionCallback(object3d, motion, gains, gui) {
  let direction = new THREE.Vector3();
  object3d.getWorldDirection(direction);
  const initialYawState = {
    rotation: Math.atan2(direction.x, direction.z),
    rotationVelocity: 0,
  };
  const initialPitchState = {
    rotation: Math.asin(-direction.y / direction.length()),
    rotationVelocity: 0,
  };

  motion = chainMotions([identityMotion(), noRotationVelocityMotion(), motion]);

  const yawController = new RotationController(
    initialYawState,
    motion.getYaw,
    gains
  );
  const pitchController = new RotationController(
    initialPitchState,
    motion.getPitch,
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
