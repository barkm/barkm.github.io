import { modulo } from "../utils";

export class PositionController {
  constructor(initialPosition) {
    this.position = initialPosition;
  }
  update(time, yaw, pitch) {
    const dx = Math.cos(pitch.rotation) * Math.sin(yaw.rotation);
    const dy = Math.sin(pitch.rotation);
    const dz = Math.cos(pitch.rotation) * Math.cos(yaw.rotation);
    this.position.x += dx * time.deltaTime;
    this.position.y -= dy * time.deltaTime;
    this.position.z += dz * time.deltaTime;
    return this.position;
  }
}

export class RotationController {
  constructor(initialState, getTarget, gains) {
    this.getTarget = getTarget;
    this.state = initialState;
    this.target = this.state;
    this.gains = gains;
  }
  update(time, position) {
    this.target = this.getTarget(time, position, this.state, this.target);
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

    return this.state;
  }
}
