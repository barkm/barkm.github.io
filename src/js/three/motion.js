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

export function getUpdateObject(object3d) {
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
  return {
    getTargetYaw: getStayWithinAreaYaw(object3d, isOutsideXZ, getCenterXZ),
    getTargetPitch: getStayWithinYPitch(signedDistanceOutsideY),
  };
}

export function getNoRotationVelocityTarget(time, state, target) {
  return { rotation: state.rotation, rotationVelocity: 0 };
}

export function getIdentityTarget(time, state, target) {
  return state;
}

function chainGetTargetRotations(getTargetRotations) {
  return (time, state, target) => {
    const chainer = (reducedTarget, getTargetRotation) =>
      getTargetRotation(time, state, reducedTarget);
    return getTargetRotations.reduce(chainer, target);
  };
}

export function getMotionCallback(
  initialYaw,
  initialPitch,
  getTargetYaw,
  getTargetPitch,
  gains,
  callbacks,
  gui
) {
  getTargetYaw = chainGetTargetRotations([
    getIdentityTarget,
    getNoRotationVelocityTarget,
    getTargetYaw,
  ]);
  getTargetPitch = chainGetTargetRotations([
    getIdentityTarget,
    getNoRotationVelocityTarget,
    getTargetPitch,
  ]);

  const yawController = new RotationController(initialYaw, getTargetYaw, gains);
  const pitchController = new RotationController(
    initialPitch,
    getTargetPitch,
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

  return (time) => {
    pitchController.update(time);
    yawController.update(time);
    callbacks.map((f) =>
      f(time, parameters.speed, pitchController.state, yawController.state)
    );
  };
}
