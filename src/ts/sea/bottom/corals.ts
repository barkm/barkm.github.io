import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { range, randomUniformInt } from "../../utils";
import { addSubscribable, Subscribable } from "../../subscribable";
import { TerrainParameters, getElevation } from "./terrain";
import { SeaParameters } from "../sea";
import { setBarycentricCoordinateAttribute } from "../../three/barycentric";
import { loadModel } from "../../three/utils";

import vertexShader from "../../../shaders/coral/vertex.glsl";
import fragmentShader from "../../../shaders/coral/fragment.glsl";
import coralModel1 from "../../../../models/corals/coral1.glb";
import coralModel2 from "../../../../models/corals/coral2.glb";

interface CoralParameters {
  numCorals: number;
  edgeThickness: Subscribable<number>;
}

function addCoral(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  parameters: CoralParameters,
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
      uLineThickness: { value: parameters.edgeThickness.value },
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

  const setElevation = () => {
    mesh.position.y =
      getElevation(mesh.position.x, mesh.position.z, terrainParameters) -
      seaParameters.depth.value;
  };
  setElevation();

  seaParameters.depth.subscribeOnFinishChange(setElevation);
  seaParameters.color.subscribeOnChange((c) => {
    material.uniforms.uSeaColor.value.set(c);
  });
  terrainParameters.amplitude.subscribeOnFinishChange(setElevation);
  terrainParameters.scale.subscribeOnFinishChange(setElevation);
  terrainParameters.persistence.subscribeOnFinishChange(setElevation);
  terrainParameters.lacunarity.subscribeOnFinishChange(setElevation);
  terrainParameters.octaves.subscribeOnFinishChange(setElevation);

  parameters.edgeThickness.subscribeOnFinishChange((v) => {
    material.uniforms.uLineThickness.value = v;
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

async function loadCoralGeometry(
  loader: GLTFLoader,
  path: string
): Promise<THREE.BufferGeometry> {
  const model = await loadModel(loader, path);
  let geometry: THREE.BufferGeometry | null = null;
  model.scene.traverse((obj: any) => {
    if (obj instanceof THREE.Mesh) {
      geometry = obj.geometry;
      setBarycentricCoordinateAttribute(geometry!);
    }
  });
  return geometry!;
}

function loadCoralGeometries() {
  const loader = new GLTFLoader();
  const promise1 = loadCoralGeometry(loader, coralModel1);
  const promise2 = loadCoralGeometry(loader, coralModel2);
  return Promise.all([promise1, promise2]);
}

export function addCorals(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  gui: dat.GUI
): void {
  const parameters = {
    numCorals: 3000,
    edgeThickness: new Subscribable(1),
  };

  loadCoralGeometries().then((geometries) => {
    const group = new THREE.Group();
    const removeAndAddCorals = () => {
      removeCorals(group);
      range(parameters.numCorals).map(() => {
        const coralIndex = randomUniformInt(0, geometries.length);
        addCoral(
          group,
          seaParameters,
          terrainParameters,
          parameters,
          geometries[coralIndex]
        );
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
    addSubscribable(gui, parameters.edgeThickness, "edgeThickness", 0, 2);
  });
}
