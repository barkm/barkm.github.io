import * as THREE from "three";

import { TerrainParameters, getElevation } from "./terrain";
import { SeaParameters } from "../sea";

import vertexShader from "../../../shaders/coral/vertex.glsl";
import fragmentShader from "../../../shaders/coral/fragment.glsl";
import { setBarycentricCoordinateAttribute } from "../../three/barycentric";

export function addCorals(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters
): void {
  const geometry = new THREE.PlaneGeometry(0.5, 0.5, 5, 5);
  const numCorals = 3000;

  setBarycentricCoordinateAttribute(geometry);

  for (let i = 0; i < numCorals; i++) {
    const hue = 100 * Math.random();
    const color = `hsl(${hue}, 100%, 85%)`;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uMinVisibility: { value: seaParameters.visibility.min.value },
        uMaxVisibility: { value: seaParameters.visibility.max.value },
        uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
        uColor: { value: new THREE.Color(color) },
        uLineThickness: { value: 1.5 },
      },
      side: THREE.DoubleSide,
      alphaToCoverage: true,
      extensions: {
        derivatives: true,
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    const scale = Math.random() + 0.5;
    mesh.scale.set(scale, scale, scale);

    mesh.position.x = 20 * (Math.random() - 0.5) * 2;
    mesh.position.z = 20 * (Math.random() - 0.5) * 2;
    mesh.position.y =
      -8 + getElevation(mesh.position.x, mesh.position.z, terrainParameters);

    parent.add(mesh);
  }
}
