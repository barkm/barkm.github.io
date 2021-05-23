import * as THREE from "three";

import { randomUniform } from "../../../utils";
import { SeaParameters } from "../../sea";
import { Time } from "../../../three/utils";
import { Subscribable } from "../../../subscribable";

import particlesVertexShader from "../../../../shaders/coral/particles/vertex.glsl";
import particlesFragmentShader from "../../../../shaders/coral/particles/fragment.glsl";

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
    positions[i] = randomUniform(boundingBox.min.x, boundingBox.max.x);
    positions[i + 1] = randomUniform(boundingBox.min.y, boundingBox.max.y);
    positions[i + 2] = randomUniform(boundingBox.min.z, boundingBox.max.z);
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
    sizes[i] = randomUniform(minSize, maxSize);
  }
  return new THREE.BufferAttribute(sizes, 1);
}

export function getParticlesMaterial(
  seaParameters: SeaParameters,
  gui: dat.GUI
) {
  const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uScale: { value: 10.0 },
      uNoiseAmplitude: { value: 0.5 },
      uNoiseFrequency: { value: 1.0 },
      uSpeed: { value: 0.05 },
      uHeightOffset: { value: 0 },
      uTime: { value: 0 },
    },
    transparent: true,
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
  const update = (time: Time) => {
    material.uniforms.uTime.value = time.elapsed;
  };

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

  return { material, update };
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
  setPositionAttribute();
  setSizeAttribute();
  parameters.minSize.subscribeOnFinishChange(setSizeAttribute);
  parameters.maxSize.subscribeOnFinishChange(setSizeAttribute);
  return geometry;
}
