import * as THREE from "three";
import SimplexNoise from "simplex-noise";

import { range, sum } from "../../utils";
import * as THREE_UTILS from "../../three/utils";
import { SeaParameters } from "../sea";

import { getNoiseMaterial } from "./caustic/noise";
import { getRefractionMaterial } from "./caustic/refraction";

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

interface BottomParameters {
  amplitude: number;
  scale: number;
  persistence: number;
  lacunarity: number;
  octaves: number;
}

function getElevation(
  x: number,
  y: number,
  parameters: BottomParameters,
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
  parameters: BottomParameters
): THREE.BufferAttribute {
  const simplex = new SimplexNoise();
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

function getBottomGeometry(gui: dat.GUI): THREE.PlaneGeometry {
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

export function addBottom(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const parameters = {
    bottomColor: seaParameters.color.value,
    causticColor: "#ffffff",
  };
  const causticGui = gui.addFolder("caustic");
  const material = getNoiseMaterial(causticGui);
  material.uniforms.uMinVisibility = {
    value: seaParameters.visibility.min.value,
  };
  material.uniforms.uMaxVisibility = {
    value: seaParameters.visibility.max.value,
  };
  material.uniforms.uSeaColor = {
    value: new THREE.Color(seaParameters.color.value),
  };
  material.uniforms.uBottomColor = {
    value: new THREE.Color(parameters.bottomColor),
  };
  material.uniforms.uCausticColor = {
    value: new THREE.Color(parameters.causticColor),
  };
  material.uniforms.uTime = { value: 0 };

  seaParameters.color.subscribe((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribe((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribe((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });

  gui
    .addColor(parameters, "bottomColor")
    .name("color")
    .onChange(
      () =>
        (material.uniforms.uBottomColor.value = new THREE.Color(
          parameters.bottomColor
        ))
    );
  causticGui
    .addColor(parameters, "causticColor")
    .name("color")
    .onChange(
      () =>
        (material.uniforms.uCausticColor.value = new THREE.Color(
          parameters.causticColor
        ))
    );

  const geometry = getBottomGeometry(gui.addFolder("terrain"));

  const bottom = new THREE.Mesh(geometry, material);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.z = -15;
  bottom.position.y = -8;

  scene.add(bottom);

  return (time) => {
    material.uniforms.uTime.value = time.elapsed;
  };
}
