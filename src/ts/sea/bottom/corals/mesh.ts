import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { SeaParameters } from "../../sea";
import { setBarycentricCoordinateAttribute } from "../../../three/barycentric";
import { loadModel, Time } from "../../../three/utils";

import vertexShader from "../../../../shaders/coral/vertex.glsl";
import fragmentShader from "../../../../shaders/coral/fragment.glsl";
import coralModel from "../../../../../models/coral.glb";
import { Subscribable } from "../../../subscribable";
import { ShimmerParameters } from "./corals";

export function getMeshMaterial(
  seaParameters: SeaParameters,
  shimmerParameters: ShimmerParameters,
  gui: dat.GUI,
  time: Subscribable<Time>,
  isDay: Subscribable<number>
) {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uPulseOffTime: { value: shimmerParameters.pulse.offTime.value },
      uPulseOnTime: { value: shimmerParameters.pulse.onTime.value },
      uPulseRampTime: { value: shimmerParameters.pulse.rampTime.value },
      uFlickerAmplitude: { value: shimmerParameters.flicker.amplitude.value },
      uFlickerSpeed: { value: shimmerParameters.flicker.speed.value },
      uLineThickness: { value: 1.0 },
      uTime: { value: 0 },
      uIsDay: { value: isDay.value },
    },
    transparent: true,
    side: THREE.DoubleSide,
    extensions: {
      derivatives: true,
    },
    precision: "highp",
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
  shimmerParameters.pulse.offTime.subscribeOnChange((v) => {
    material.uniforms.uPulseOffTime.value = v;
  });
  shimmerParameters.pulse.onTime.subscribeOnChange((v) => {
    material.uniforms.uPulseOnTime.value = v;
  });
  shimmerParameters.pulse.rampTime.subscribeOnChange((v) => {
    material.uniforms.uPulseRampTime.value = v;
  });
  shimmerParameters.flicker.amplitude.subscribeOnChange((v) => {
    material.uniforms.uFlickerAmplitude.value = v;
  });
  shimmerParameters.flicker.speed.subscribeOnChange((v) => {
    material.uniforms.uFlickerSpeed.value = v;
  });
  isDay.subscribeOnChange((d) => {
    material.uniforms.uIsDay.value = d;
  });
  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });
  gui
    .add(material.uniforms.uLineThickness, "value")
    .min(0)
    .max(2)
    .name("edgeThickness");
  return material;
}

export async function loadMeshGeometry(): Promise<THREE.BufferGeometry> {
  const loader = new GLTFLoader();
  const model = await loadModel(loader, coralModel);
  let geometry: THREE.BufferGeometry | null = null;
  model.scene.traverse((obj: any) => {
    if (obj instanceof THREE.Mesh) {
      geometry = obj.geometry;
      setBarycentricCoordinateAttribute(geometry!);
    }
  });
  return geometry!;
}
