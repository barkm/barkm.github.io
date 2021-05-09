import * as THREE from "three";

import vertexShader from "../../../shaders/caustic/noise/vertex.glsl";
import bottomFragmentShader from "../../../shaders/caustic/noise/fragment.glsl";

export function getNoiseMaterial(gui: dat.GUI): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: bottomFragmentShader,
    uniforms: {
      uCausticStrength: { value: 3.0 },
      uCausticSpeed: { value: 0.05 },
      uCausticOffset: { value: 100.0 },
      uCausticScale: { value: 10.0 },
      uCausticIterations: { value: 3 },
    },
  });

  gui
    .add(material.uniforms.uCausticStrength, "value")
    .min(0)
    .max(50)
    .step(0.1)
    .name("strength");
  gui
    .add(material.uniforms.uCausticSpeed, "value")
    .min(0)
    .max(0.5)
    .step(0.01)
    .name("speed");
  gui
    .add(material.uniforms.uCausticOffset, "value")
    .min(0)
    .max(200)
    .name("offset");
  gui
    .add(material.uniforms.uCausticIterations, "value")
    .min(0)
    .max(10)
    .step(1)
    .name("iterations");
  gui
    .add(material.uniforms.uCausticScale, "value")
    .min(0)
    .max(50)
    .step(0.01)
    .name("scale");

  return material;
}
