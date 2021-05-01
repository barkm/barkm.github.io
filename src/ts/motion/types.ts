import { Time } from "../three/utils";

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Orientation<Type> {
  yaw: Type;
  pitch: Type;
}

export interface Rotation {
  rotation: number;
  rotationVelocity: number;
}

export type TargetFunction = (
  time: Time,
  pos: Position,
  state: Rotation,
  target: Rotation
) => Rotation;

export interface Motion {
  yaw: TargetFunction;
  pitch: TargetFunction;
}
