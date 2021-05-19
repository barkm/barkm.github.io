import * as THREE from "three";
import SimplexNoise from "simplex-noise";

import { range, sum } from "../../utils";
import { Subscribable, addSubscribable } from "../../subscribable";
import { SeaParameters } from "../sea";

function getElevationOctave(
  x: number,
  z: number,
  persistence: number,
  lacunarity: number,
  octave: number,
  simplex: SimplexNoise
): number {
  const amplitude = Math.pow(persistence, octave);
  const frequency = Math.pow(lacunarity, octave);
  return amplitude * (simplex.noise2D(frequency * x, frequency * z) + 1) * 0.5;
}

export interface TerrainParameters {
  amplitude: Subscribable<number>;
  scale: Subscribable<number>;
  persistence: Subscribable<number>;
  lacunarity: Subscribable<number>;
  octaves: Subscribable<number>;
}

export function getElevation(
  x: number,
  z: number,
  parameters: TerrainParameters
): number {
  const simplex = new SimplexNoise("seed");
  const elevations = range(parameters.octaves.value).map((octave) =>
    getElevationOctave(
      parameters.scale.value * x,
      parameters.scale.value * z,
      parameters.persistence.value,
      parameters.lacunarity.value,
      octave,
      simplex
    )
  );
  return parameters.amplitude.value * sum(elevations);
}

function getNewPositions(
  positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  parameters: TerrainParameters
): THREE.BufferAttribute {
  const newPositions = positions.clone();
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);
    let elevation = getElevation(x, z, parameters);
    newPositions.setY(i, y + elevation);
  }
  return newPositions;
}

function getTerrainGeometry(
  seaParameters: SeaParameters,
  parameters: TerrainParameters
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(
    seaParameters.width,
    seaParameters.height,
    128,
    (128 * seaParameters.height) / seaParameters.width
  );
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -seaParameters.height / 2);
  const positions = geometry.getAttribute("position").clone();
  const update = () => {
    const newPositions = getNewPositions(positions, parameters);
    geometry.setAttribute("position", newPositions);
    geometry.getAttribute("position").needsUpdate = true;
  };
  update();
  Object.values(parameters).map((p) => p.subscribeOnChange(update));
  return geometry;
}

export function getTerrain(
  seaParameters: SeaParameters,
  gui: dat.GUI
): { geometry: THREE.PlaneGeometry; parameters: TerrainParameters } {
  const parameters = {
    amplitude: new Subscribable(1.5),
    scale: new Subscribable(0.1),
    persistence: new Subscribable(0.6),
    lacunarity: new Subscribable(1.8),
    octaves: new Subscribable(3),
  };
  addSubscribable(gui, parameters.amplitude, "amplitude", 0, 5);
  addSubscribable(gui, parameters.scale, "scale", 0, 0.5);
  addSubscribable(gui, parameters.persistence, "persistence", 0, 1);
  addSubscribable(gui, parameters.lacunarity, "lacunarity", 0, 3);
  addSubscribable(gui, parameters.octaves, "ocataves", 1, 5, 1);
  return {
    geometry: getTerrainGeometry(seaParameters, parameters),
    parameters: parameters,
  };
}
