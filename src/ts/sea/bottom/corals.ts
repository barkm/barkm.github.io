import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { TerrainParameters, getElevation } from "./terrain";
import { SeaParameters } from "../sea";
import { setBarycentricCoordinateAttribute } from "../../three/barycentric";

import vertexShader from "../../../shaders/coral/vertex.glsl";
import fragmentShader from "../../../shaders/coral/fragment.glsl";
import coralModel from "../../../../models/corals/coral1.glb";
import { range } from "../../utils";

function addCoral(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  geometry: THREE.BufferGeometry
) {
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

  const mesh = new THREE.Mesh(geometry!, material);
  const scale = Math.random() + 0.5;
  mesh.scale.set(scale, scale, scale);
  mesh.rotateY(2 * Math.PI * Math.random());
  mesh.position.x = 20 * (Math.random() - 0.5) * 2;
  mesh.position.z = 20 * (Math.random() - 0.5) * 2;
  mesh.position.y =
    getElevation(mesh.position.x, mesh.position.z, terrainParameters) -
    seaParameters.depth.value;
  seaParameters.depth.subscribeOnFinishChange((d) => {
    mesh.position.y =
      getElevation(mesh.position.x, mesh.position.z, terrainParameters) - d;
  });
  seaParameters.color.subscribeOnChange((c) => {
    material.uniforms.uSeaColor.value.set(c);
  });
  parent.add(mesh);
}

function removeCorals(group: THREE.Group): void {
  const toRemove: Array<THREE.Mesh> = [];
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.material.dispose();
      toRemove.push(obj);
    }
  });
  toRemove.forEach((mesh) => group.remove(mesh));
}

export function addCorals(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  gui: dat.GUI
): void {
  const parameters = {
    numCorals: 5000,
  };

  const group = new THREE.Group();
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(coralModel, (gltf) => {
    let geometry: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        geometry = obj.geometry;
        setBarycentricCoordinateAttribute(geometry!);
      }
    });
    const removeAndAddCorals = () => {
      removeCorals(group);
      range(parameters.numCorals).map(() => {
        addCoral(group, seaParameters, terrainParameters, geometry!);
      });
    };
    removeAndAddCorals();
    parent.add(group);

    gui
      .add(parameters, "numCorals")
      .min(0)
      .max(10000)
      .step(500)
      .onFinishChange(removeAndAddCorals);
    terrainParameters.amplitude.subscribeOnFinishChange(removeAndAddCorals);
    terrainParameters.scale.subscribeOnFinishChange(removeAndAddCorals);
    terrainParameters.persistence.subscribeOnFinishChange(removeAndAddCorals);
    terrainParameters.lacunarity.subscribeOnFinishChange(removeAndAddCorals);
    terrainParameters.octaves.subscribeOnFinishChange(removeAndAddCorals);
  });
}
