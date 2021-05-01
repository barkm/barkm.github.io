import * as THREE from "three";

import { Orientation, Position, Rotation } from "../motion/types";

export function updateObject(
  object3d: THREE.Object3D,
  position: Position,
  rotations: Orientation<Rotation>
): void {
  object3d.setRotationFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    rotations.yaw.rotation
  );
  object3d.rotateX(rotations.pitch.rotation);
  object3d.rotateZ(-rotations.yaw.rotationVelocity);
  object3d.position.set(position.x, position.y, position.z);
}

export function getInitialRotations(
  object3d: THREE.Object3D
): Orientation<Rotation> {
  let direction = new THREE.Vector3();
  object3d.getWorldDirection(direction);
  const yaw = {
    rotation: Math.atan2(direction.x, direction.z),
    rotationVelocity: 0,
  };
  const pitch = {
    rotation: Math.asin(-direction.y / direction.length()),
    rotationVelocity: 0,
  };
  return {
    yaw,
    pitch,
  };
}
