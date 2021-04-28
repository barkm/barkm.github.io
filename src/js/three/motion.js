import * as THREE from "three";

export function updateObject(object3d, time, speed, yaw, pitch) {
  object3d.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw.rotation);
  object3d.rotateX(pitch.rotation);
  object3d.rotateZ(-yaw.rotationVelocity);

  const direction = new THREE.Vector3();
  object3d.getWorldDirection(direction);
  object3d.position.add(direction.multiplyScalar(speed * time.deltaTime));
}
