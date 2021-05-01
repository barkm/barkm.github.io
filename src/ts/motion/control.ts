import { modulo } from "../utils";
import { Time } from "../three/utils";
import { Position, Rotation, TargetFunction } from "./types";

export class PositionController {
  position: Position;
  constructor(initialPosition: Position) {
    this.position = initialPosition;
  }
  update(time: Time, yaw: Rotation, pitch: Rotation) {
    const dx = Math.cos(pitch.rotation) * Math.sin(yaw.rotation);
    const dy = Math.sin(pitch.rotation);
    const dz = Math.cos(pitch.rotation) * Math.cos(yaw.rotation);
    this.position.x += dx * time.delta;
    this.position.y -= dy * time.delta;
    this.position.z += dz * time.delta;
    return this.position;
  }
}

export class RotationController {
  state: Rotation;
  target: Rotation;
  constructor(
    initialState: Rotation,
    public getTarget: TargetFunction,
    public gains: Rotation
  ) {
    this.getTarget = getTarget;
    this.state = initialState;
    this.target = this.state;
    this.gains = gains;
  }
  update(time: Time, position: Position) {
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
      time.delta * (inputRotation + inputRotationVelocity);
    this.state.rotation += time.delta * this.state.rotationVelocity;

    return this.state;
  }
}
