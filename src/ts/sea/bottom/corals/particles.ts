import * as THREE from "three";

import { SeaParameters } from "../../sea";
import { setColorAttribute, Time } from "../../../three/utils";
import { Subscribable } from "../../../subscribable";

import particlesVertexShader from "../../../../shaders/coral/particles/vertex.glsl";
import particlesFragmentShader from "../../../../shaders/coral/particles/fragment.glsl";

import { ShimmerParameters } from "./corals";
export interface ParticlesParameters {
  numPerCoral: Subscribable<number>;
  minSize: Subscribable<number>;
  maxSize: Subscribable<number>;
}

function getParticlePositionAttribute(count: number, boundingBox: THREE.Box3) {
  const positions = new Float32Array(3 * count);
  const boundingBoxSize = new THREE.Vector3();
  boundingBox.getSize(boundingBoxSize);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = THREE.MathUtils.randFloat(
      boundingBox.min.x,
      boundingBox.max.x
    );
    positions[i + 1] = THREE.MathUtils.randFloat(
      boundingBox.min.y,
      boundingBox.max.y
    );
    positions[i + 2] = THREE.MathUtils.randFloat(
      boundingBox.min.z,
      boundingBox.max.z
    );
  }
  return new THREE.BufferAttribute(positions, 3);
}

function getParticleSizeAttribute(
  count: number,
  minSize: number,
  maxSize: number
) {
  const sizes = new Float32Array(count);
  for (let i = 0; i < sizes.length; i++) {
    sizes[i] = THREE.MathUtils.randFloat(minSize, maxSize);
  }
  return new THREE.BufferAttribute(sizes, 1);
}

export function getParticlesMaterial(
  seaParameters: SeaParameters,
  shimmerParameters: ShimmerParameters,
  gui: dat.GUI,
  time: Subscribable<Time>,
  isDay: Subscribable<number>
) {
  const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uPulseOffTime: { value: shimmerParameters.pulse.offTime.value },
      uPulseOnTime: { value: shimmerParameters.pulse.onTime.value },
      uPulseRampTime: { value: shimmerParameters.pulse.rampTime.value },
      uFlickerAmplitude: { value: shimmerParameters.flicker.amplitude.value },
      uFlickerSpeed: { value: shimmerParameters.flicker.speed.value },
      uScale: { value: 10.0 },
      uNoiseAmplitude: { value: 0.5 },
      uNoiseFrequency: { value: 1.0 },
      uSpeed: { value: 0.05 },
      uHeightOffset: { value: 0 },
      uTime: { value: 0 },
      uIsDay: { value: isDay.value },
    },
    transparent: true,
    precision: "highp",
    depthWrite: false,
  });
  seaParameters.visibility.min.subscribeOnChange((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribeOnChange((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });
  seaParameters.color.subscribeOnChange((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
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
  isDay.subscribeOnFinishChange((d) => {
    material.uniforms.uIsDay.value = d;
  });
  gui.add(material.uniforms.uScale, "value").min(0).max(20).name("scale");
  gui
    .add(material.uniforms.uNoiseAmplitude, "value")
    .min(0)
    .max(2)
    .name("noiseAmplitude");
  gui
    .add(material.uniforms.uNoiseFrequency, "value")
    .min(0)
    .max(2)
    .name("noiseFrequency");
  gui.add(material.uniforms.uSpeed, "value").min(0).max(0.1).name("speed");
  gui.add(material.uniforms.uHeightOffset, "value", 0, 1).name("heightOffset");

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return material;
}

export function getParticlesGeometry(
  parameters: ParticlesParameters,
  boundingBox: THREE.Box3
) {
  const geometry = new THREE.BufferGeometry();
  const setPositionAttribute = () => {
    const position = getParticlePositionAttribute(
      parameters.numPerCoral.value,
      boundingBox
    );
    geometry.setAttribute("position", position);
  };
  const setSizeAttribute = () => {
    geometry.setAttribute(
      "aSize",
      getParticleSizeAttribute(
        parameters.numPerCoral.value,
        parameters.minSize.value,
        parameters.maxSize.value
      )
    );
  };
  const setAttributes = () => {
    setPositionAttribute();
    setSizeAttribute();
  };
  setAttributes();
  parameters.minSize.subscribeOnFinishChange(setSizeAttribute);
  parameters.maxSize.subscribeOnFinishChange(setSizeAttribute);
  parameters.numPerCoral.subscribeOnFinishChange(setAttributes);
  return geometry;
}
