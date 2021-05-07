import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";

import bottomVertexShader from "../../shaders/bottom/vertex.glsl";
import bottomFragmentShader from "../../shaders/bottom/fragment.glsl";

import { SeaParameters } from "./sea";

export function addBottom(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const parameters = {
    bottomColor: "#ffffff",
    causticsColor: "#0000ff",
  };

  const bottom = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 50),
    new THREE.ShaderMaterial({
      vertexShader: bottomVertexShader,
      fragmentShader: bottomFragmentShader,
      uniforms: {
        uMinVisibility: { value: seaParameters.visibility.min.value },
        uMaxVisibility: { value: seaParameters.visibility.max.value },
        uBottomColor: { value: new THREE.Color(parameters.bottomColor) },
        uCausticColor: { value: new THREE.Color(parameters.causticsColor) },
        uCausticStrength: { value: 3.0 },
        uCausticSpeed: { value: 0.05 },
        uCausticOffset: { value: 100.0 },
        uCausticScale: { value: 10.0 },
        uCausticIterations: { value: 3 },
        uTime: { value: 0 },
        uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      },
    })
  );
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = -8;
  scene.add(bottom);

  seaParameters.color.subscribe((v) => {
    bottom.material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribe((v) => {
    bottom.material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribe((v) => {
    bottom.material.uniforms.uMaxVisibility.value = v;
  });

  gui
    .addColor(parameters, "bottomColor")
    .name("color")
    .onChange(
      () =>
        (bottom.material.uniforms.uBottomColor.value = new THREE.Color(
          parameters.bottomColor
        ))
    );
  const causticGui = gui.addFolder("caustic");
  causticGui
    .addColor(parameters, "causticsColor")
    .name("color")
    .onChange(
      () =>
        (bottom.material.uniforms.uCausticColor.value = new THREE.Color(
          parameters.causticsColor
        ))
    );
  causticGui
    .add(bottom.material.uniforms.uCausticStrength, "value")
    .min(0)
    .max(50)
    .step(0.1)
    .name("strength");
  causticGui
    .add(bottom.material.uniforms.uCausticSpeed, "value")
    .min(0)
    .max(0.5)
    .step(0.01)
    .name("speed");
  causticGui
    .add(bottom.material.uniforms.uCausticOffset, "value")
    .min(0)
    .max(200)
    .name("offset");
  causticGui
    .add(bottom.material.uniforms.uCausticIterations, "value")
    .min(0)
    .max(10)
    .step(1)
    .name("iterations");
  causticGui
    .add(bottom.material.uniforms.uCausticScale, "value")
    .min(0)
    .max(50)
    .step(0.01)
    .name("scale");

  return (time) => {
    bottom.material.uniforms.uTime.value = time.elapsed;
  };
}
