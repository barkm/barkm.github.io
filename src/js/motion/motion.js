import * as THREE from "three";

import { RotationController } from "./control";

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

export function getMotionCallback(initial, getTarget, gains, gui) {
  const getTargetYaw = chainGetTargetRotations([
    getIdentityTarget,
    getNoRotationVelocityTarget,
    getTarget.yaw,
  ]);
  const getTargetPitch = chainGetTargetRotations([
    getIdentityTarget,
    getNoRotationVelocityTarget,
    getTarget.pitch,
  ]);

  const yawController = new RotationController(
    initial.yaw,
    getTargetYaw,
    gains
  );
  const pitchController = new RotationController(
    initial.pitch,
    getTargetPitch,
    gains
  );

  if (gui) {
    gui.add(gains, "rotation").min(0).max(5);
    gui.add(gains, "rotationVelocity").min(0).max(5);
  }

  return (time) => {
    yawController.update(time);
    pitchController.update(time);
    return {
      yaw: yawController.state,
      pitch: pitchController.state,
    };
  };
}
