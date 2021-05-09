import * as THREE from "three";

import vertexShader from "../../../shaders/caustic/refraction/vertex.glsl";
import fragmentShader from "../../../shaders/caustic/refraction/fragment.glsl";

export function getRefractionMaterial(gui: dat.GUI): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uCausticStrength: { value: 0.5 },
    },
    extensions: {
      derivatives: true,
    },
  });

  gui
    .add(material.uniforms.uCausticStrength, "value")
    .min(0)
    .max(1)
    .step(0.01)
    .name("strength");

  return material;
}
