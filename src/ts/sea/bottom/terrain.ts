import * as THREE from "three";
import SimplexNoise from "simplex-noise";

import { range, sum, Subscribable } from "../../utils";

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
  parameters: TerrainParameters
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(50, 50, 128, 128);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.getAttribute("position").clone();
  const update = () => {
    const newPositions = getNewPositions(positions, parameters);
    geometry.setAttribute("position", newPositions);
    geometry.getAttribute("position").needsUpdate = true;
  };
  update();
  Object.values(parameters).map((p) => p.subscribe(update));
  return geometry;
}

export function getTerrain(
  gui: dat.GUI
): { geometry: THREE.PlaneGeometry; parameters: TerrainParameters } {
  const parameters = {
    amplitude: new Subscribable(2),
    scale: new Subscribable(0.1),
    persistence: new Subscribable(1),
    lacunarity: new Subscribable(1),
    octaves: new Subscribable(1),
  };
  gui.add(parameters.amplitude, "value").min(0).max(5).name("amplitude");
  gui.add(parameters.scale, "value").min(0).max(0.5).name("scale");
  gui.add(parameters.persistence, "value").min(0).max(1).name("persistence");
  gui.add(parameters.lacunarity, "value").min(0).max(3).name("lacunarity");
  gui.add(parameters.octaves, "value").min(1).max(5).step(1).name("octaves");
  return {
    geometry: getTerrainGeometry(parameters),
    parameters: parameters,
  };
}
