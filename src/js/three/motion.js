import * as THREE from "three";

export function updateObject(object3d, position, yaw, pitch) {
  object3d.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw.rotation);
  object3d.rotateX(pitch.rotation);
  object3d.rotateZ(-yaw.rotationVelocity);
  object3d.position.set(position.x, position.y, position.z);
}

export function getInitialRotations(object3d) {
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
