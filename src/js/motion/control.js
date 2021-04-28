import { modulo } from "../utils";

export class RotationController {
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
