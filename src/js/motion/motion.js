import * as THREE from "three";

import * as UTILS from "../utils";

import { PositionController, RotationController } from "./control";

function getStayWithinAreaYaw(isOutSideXZ, getCenterXZ) {
  return (time, position, state, target) => {
    if (isOutSideXZ(position)) {
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
  return (time, position, state, target) => {
    const distance = signedDistanceOutsideY(position);
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

export function getStayWithinBoxMotion(center, sides) {
  const isOutsideXZ = (position) => {
    return (
      Math.abs(position.x) > sides.width / 2 ||
      Math.abs(position.z) > sides.depth / 2
    );
  };
  const getCenterXZ = () => {
    return { x: center.x, z: center.z };
  };
  const signedDistanceOutsideY = (position) => {
    const distance = position.y - center.y;
    if (Math.abs(distance) > sides.height / 2) {
      return distance - (sides.height / 2) * Math.sign(position.y);
    }
    return 0;
  };
  return {
    yaw: getStayWithinAreaYaw(isOutsideXZ, getCenterXZ),
    pitch: getStayWithinYPitch(signedDistanceOutsideY),
  };
}

function clampRotationTarget(min, max) {
  return (time, position, state, target) => {
    return {
      rotation: THREE.MathUtils.clamp(target.rotation, min, max),
      rotationVelocity: target.rotationVelocity,
    };
  };
}

function perturbeRotationTarget(maxPerturbation, interval) {
  let lastUpdateTime = null;
  return (time, position, state, target) => {
    let rotation = target.rotation;
    if (!lastUpdateTime || time.elapsedTime - lastUpdateTime > interval) {
      lastUpdateTime = time.elapsedTime;
      rotation += UTILS.randomUniform(-maxPerturbation, maxPerturbation);
    }
    return {
      rotation: rotation,
      rotationVelocity: target.rotationVelocity,
    };
  };
}

export function perturbationMotion(maxPerturbation, interval) {
  return {
    yaw: perturbeRotationTarget(maxPerturbation.yaw, interval),
    pitch: perturbeRotationTarget(maxPerturbation.pitch, interval),
  };
}

function chainGetTargetRotations(getTargetRotations) {
  return (time, position, state, target) => {
    const chainer = (reducedTarget, getTargetRotation) =>
      getTargetRotation(time, position, state, reducedTarget);
    return getTargetRotations.reduce(chainer, target);
  };
}

export function chainMotions(motions) {
  return {
    yaw: chainGetTargetRotations(motions.map((m) => m.yaw)),
    pitch: chainGetTargetRotations(motions.map((m) => m.pitch)),
  };
}

export function getMotionCallback(
  intialPosition,
  initialRotation,
  getTargetRotation,
  gain
) {
  const positionController = new PositionController(intialPosition);
  const yawController = new RotationController(
    initialRotation.yaw,
    getTargetRotation.yaw,
    gain.yaw
  );
  const pitchController = new RotationController(
    initialRotation.pitch,
    chainGetTargetRotations([
      getTargetRotation.pitch,
      clampRotationTarget(-Math.PI / 2, Math.PI / 2),
    ]),
    gain.pitch
  );
  return (time) => {
    const yaw = yawController.update(time, positionController.position);
    const pitch = pitchController.update(time, positionController.position);
    return {
      position: positionController.update(time, yaw, pitch),
      yaw,
      pitch,
    };
  };
}
