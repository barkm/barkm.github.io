import * as THREE from "three";

import vertexShader from "../../../../shaders/caustic/noise/vertex.glsl";
import bottomFragmentShader from "../../../../shaders/caustic/noise/fragment.glsl";

export function getNoiseMaterial(gui: dat.GUI): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: bottomFragmentShader,
    uniforms: {
      uCausticStrength: { value: 1.0 },
      uCausticSpeed: { value: 0.1 },
      uCausticLacunarity: { value: 1.2 },
      uCausticPersistance: { value: 0.75 },
      uCausticScale: { value: 20.0 },
      uCausticIterations: { value: 3 },
    },
  });

  gui
    .add(material.uniforms.uCausticStrength, "value")
    .min(0)
    .max(10)
    .step(0.01)
    .name("strength");
  gui
    .add(material.uniforms.uCausticSpeed, "value")
    .min(0)
    .max(0.5)
    .step(0.01)
    .name("speed");
  gui
    .add(material.uniforms.uCausticLacunarity, "value")
    .min(0)
    .max(5)
    .name("lacunarity");
  gui
    .add(material.uniforms.uCausticPersistance, "value")
    .min(0)
    .max(1)
    .name("persistance");
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
