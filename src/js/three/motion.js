import * as THREE from "three";

export function updateObject(object3d, time, speed, yaw, pitch) {
  object3d.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw.rotation);
  object3d.rotateX(pitch.rotation);
  object3d.rotateZ(-yaw.rotationVelocity);

  const direction = new THREE.Vector3();
  object3d.getWorldDirection(direction);
  object3d.position.add(direction.multiplyScalar(speed * time.deltaTime));
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
