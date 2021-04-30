import * as THREE from "three";

import { PositionController, RotationController } from "./control";

function getStayWithinAreaYaw(position, isOutSideXZ, getCenterXZ) {
  return (time, state, target) => {
    if (isOutSideXZ()) {
      const origin = getCenterXZ();
      const deltaX = origin.x - position.x;
      const deltaZ = origin.z - position.z;
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

export function getStayWithinBoxMotion(position, center, sides) {
  const isOutsideXZ = () => {
    return (
      Math.abs(position.x) > sides.width / 2 ||
      Math.abs(position.z) > sides.depth / 2
    );
  };
  const getCenterXZ = () => {
    return { x: center.x, z: center.z };
  };
  const signedDistanceOutsideY = () => {
    const distance = position.y - center.y;
    if (Math.abs(distance) > sides.height / 2) {
      return distance - (sides.height / 2) * Math.sign(position.y);
    }
    return 0;
  };
  return {
    yaw: getStayWithinAreaYaw(position, isOutsideXZ, getCenterXZ),
    pitch: getStayWithinYPitch(signedDistanceOutsideY),
  };
}

function getNoRotationVelocityTarget(time, state, target) {
  return { rotation: state.rotation, rotationVelocity: 0 };
}

function getIdentityTarget(time, state, target) {
  return state;
}

function chainGetTargetRotations(getTargetRotations) {
  return (time, state, target) => {
    const chainer = (reducedTarget, getTargetRotation) =>
      getTargetRotation(time, state, reducedTarget);
    return getTargetRotations.reduce(chainer, target);
  };
}

function getRotationController(initialRotation, getTargetRotation, gains) {
  getTargetRotation = chainGetTargetRotations([
    getIdentityTarget,
    getNoRotationVelocityTarget,
    getTargetRotation,
  ]);
  return new RotationController(initialRotation, getTargetRotation, gains);
}

export function getMotionCallback(
  intialPosition,
  initialRotation,
  getTargetRotation,
  gain
) {
  const positionController = new PositionController(intialPosition);
  const yawController = getRotationController(
    initialRotation.yaw,
    getTargetRotation.yaw,
    gain.yaw
  );
  const pitchController = getRotationController(
    initialRotation.pitch,
    getTargetRotation.pitch,
    gain.yaw
  );
  return (time) => {
    const yaw = yawController.update(time);
    const pitch = pitchController.update(time);
    return {
      position: positionController.update(time, yaw, pitch),
      yaw,
      pitch,
    };
  };
}
