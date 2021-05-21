import * as THREE from "three";

import * as UTILS from "../utils";
import { Time } from "../three/utils";
import {
  Motion,
  Orientation,
  Position,
  Rotation,
  TargetFunction,
} from "./types";

import { PositionController, RotationController } from "./control";

interface CenterXZ {
  x: number;
  z: number;
}
function getStayWithinAreaYaw(
  isOutSideXZ: (pos: Position) => boolean,
  getCenterXZ: () => CenterXZ
): TargetFunction {
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

function getStayWithinYPitch(
  signedDistanceOutsideY: (pos: Position) => number
): TargetFunction {
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

interface Sides {
  width: number;
  height: number;
  depth: number;
}
export function getStayWithinBoxMotion(center: Position, sides: Sides): Motion {
  const isOutsideXZ = (position: Position): boolean => {
    return (
      Math.abs(position.x) > sides.width / 2 ||
      Math.abs(position.z) > sides.depth / 2
    );
  };
  const getCenterXZ = (): CenterXZ => {
    return center;
  };
  const signedDistanceOutsideY = (position: Position) => {
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

function clampRotationTarget(min: number, max: number): TargetFunction {
  return (time, position, state, target) => {
    return {
      rotation: THREE.MathUtils.clamp(target.rotation, min, max),
      rotationVelocity: target.rotationVelocity,
    };
  };
}

function perturbeRotationTarget(
  maxPerturbation: number,
  interval: number
): TargetFunction {
  let lastUpdateTime: number | null = null;
  return (time, position, state, target) => {
    let rotation = target.rotation;
    if (!lastUpdateTime || time.elapsed - lastUpdateTime > interval) {
      lastUpdateTime = time.elapsed;
      rotation += UTILS.randomUniform(-maxPerturbation, maxPerturbation);
    }
    return {
      rotation: rotation,
      rotationVelocity: target.rotationVelocity,
    };
  };
}

export function perturbationMotion(
  maxPerturbation: Orientation<number>,
  interval: number
): Motion {
  return {
    yaw: perturbeRotationTarget(maxPerturbation.yaw, interval),
    pitch: perturbeRotationTarget(maxPerturbation.pitch, interval),
  };
}

function chainGetTargetRotations(
  getTargetRotations: Array<TargetFunction>
): TargetFunction {
  return (time, position, state, target) => {
    const chainer = (
      reducedTarget: Rotation,
      getTargetRotation: TargetFunction
    ) => getTargetRotation(time, position, state, reducedTarget);
    return getTargetRotations.reduce(chainer, target);
  };
}

export function chainMotions(motions: Array<Motion>): Motion {
  return {
    yaw: chainGetTargetRotations(motions.map((m) => m.yaw)),
    pitch: chainGetTargetRotations(motions.map((m) => m.pitch)),
  };
}

export function getMotionCallback(
  intialPosition: Position,
  initialRotation: Orientation<Rotation>,
  getTargetRotation: Orientation<TargetFunction>,
  gain: Orientation<Rotation>,
  speed: number
): (t: Time) => { position: Position; rotations: Orientation<Rotation> } {
  const positionController = new PositionController(intialPosition, speed);
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
      rotations: { yaw, pitch },
    };
  };
}
