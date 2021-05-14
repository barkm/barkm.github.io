import * as THREE from "three";
import SimplexNoise from "simplex-noise";

import { range, sum } from "../../utils";

function getElevationOctave(
  x: number,
  y: number,
  persistence: number,
  lacunarity: number,
  octave: number,
  simplex: SimplexNoise
): number {
  const amplitude = Math.pow(persistence, octave);
  const frequency = Math.pow(lacunarity, octave);
  return amplitude * (simplex.noise2D(frequency * x, frequency * y) + 1) * 0.5;
}

interface TerrainParameters {
  amplitude: number;
  scale: number;
  persistence: number;
  lacunarity: number;
  octaves: number;
}

function getElevation(
  x: number,
  y: number,
  parameters: TerrainParameters,
  simplex: SimplexNoise
): number {
  const elevations = range(parameters.octaves).map((octave) =>
    getElevationOctave(
      x,
      y,
      parameters.persistence,
      parameters.lacunarity,
      octave,
      simplex
    )
  );
  return sum(elevations);
}

function getNewPositions(
  positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  parameters: TerrainParameters
): THREE.BufferAttribute {
  const simplex = new SimplexNoise("seed");
  const newPositions = positions.clone();
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);
    let elevation =
      parameters.amplitude *
      getElevation(
        parameters.scale * x,
        parameters.scale * y,
        parameters,
        simplex
      );
    newPositions.setZ(i, z + elevation);
  }
  return newPositions;
}

export function getTerrain(gui: dat.GUI): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(50, 50, 128, 128);
  const positions = geometry.getAttribute("position").clone();
  const update = () => {
    const newPositions = getNewPositions(positions, parameters);
    geometry.setAttribute("position", newPositions);
    geometry.getAttribute("position").needsUpdate = true;
  };
  const parameters = {
    amplitude: 2,
    scale: 0.1,
    persistence: 1,
    lacunarity: 1,
    octaves: 1,
  };
  update();
  gui.add(parameters, "amplitude").min(0).max(5).onFinishChange(update);
  gui.add(parameters, "scale").min(0).max(0.5).onFinishChange(update);
  gui.add(parameters, "persistence").min(0).max(1).onFinishChange(update);
  gui.add(parameters, "lacunarity").min(0).max(3).onFinishChange(update);
  gui.add(parameters, "octaves").min(1).max(5).step(1).onFinishChange(update);
  return geometry;
}
