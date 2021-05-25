import * as THREE from "three";

import vertexShader from "../../../shaders/caustic/vertex.glsl";
import bottomFragmentShader from "../../../shaders/caustic/fragment.glsl";
import { SeaParameters } from "../sea";

export function getCausticMaterial(
  seaParameters: SeaParameters,
  gui: dat.GUI
): THREE.ShaderMaterial {
  const parameters = {
    bottomColor: seaParameters.color.value,
    causticColor: "#ffffff",
  };
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
      uMinVisibility: {
        value: seaParameters.visibility.min.value,
      },
      uMaxVisibility: {
        value: seaParameters.visibility.max.value,
      },
      uSeaColor: {
        value: new THREE.Color(seaParameters.color.value),
      },
      uBottomColor: {
        value: new THREE.Color(parameters.bottomColor),
      },
      uCausticColor: {
        value: new THREE.Color(parameters.causticColor),
      },
      uTime: { value: 0 },
    },
    precision: "highp",
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
    .max(3)
    .step(1)
    .name("iterations");
  gui
    .add(material.uniforms.uCausticScale, "value")
    .min(0)
    .max(50)
    .step(0.01)
    .name("scale");

  seaParameters.color.subscribeOnChange((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribeOnChange((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribeOnChange((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });

  gui
    .addColor(parameters, "bottomColor")
    .onChange(
      () =>
        (material.uniforms.uBottomColor.value = new THREE.Color(
          parameters.bottomColor
        ))
    );
  gui
    .addColor(parameters, "causticColor")
    .onChange(
      () =>
        (material.uniforms.uCausticColor.value = new THREE.Color(
          parameters.causticColor
        ))
    );

  return material;
}
