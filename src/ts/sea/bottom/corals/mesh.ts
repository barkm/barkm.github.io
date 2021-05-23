import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { addSubscribable, Subscribable } from "../../../subscribable";
import { SeaParameters } from "../../sea";
import { setBarycentricCoordinateAttribute } from "../../../three/barycentric";
import { loadModel } from "../../../three/utils";

import vertexShader from "../../../../shaders/coral/vertex.glsl";
import fragmentShader from "../../../../shaders/coral/fragment.glsl";
import coralModel1 from "../../../../../models/corals/coral1.glb";
import coralModel2 from "../../../../../models/corals/coral2.glb";

export function getMeshMaterial(seaParameters: SeaParameters, gui: dat.GUI) {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uLineThickness: { value: 1.0 },
      uTime: { value: 0 },
    },
    side: THREE.DoubleSide,
    alphaToCoverage: true,
    extensions: {
      derivatives: true,
    },
  });

  seaParameters.color.subscribeOnChange((c) => {
    material.uniforms.uSeaColor.value.set(c);
  });
  seaParameters.visibility.min.subscribeOnChange((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribeOnChange((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });
  gui
    .add(material.uniforms.uLineThickness, "value")
    .min(0)
    .max(2)
    .name("edgeThickness");
  return material;
}

async function loadMeshGeometry(
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

export function loadMeshGeometries() {
  const loader = new GLTFLoader();
  const promise1 = loadMeshGeometry(loader, coralModel1);
  const promise2 = loadMeshGeometry(loader, coralModel2);
  return Promise.all([promise1, promise2]);
}
