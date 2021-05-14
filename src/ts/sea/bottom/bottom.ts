import * as THREE from "three";

import { Subscribable } from "../../utils";
import * as THREE_UTILS from "../../three/utils";
import { SeaParameters } from "../sea";

import { getNoiseMaterial } from "./caustic/noise";
import { getTerrain } from "./terrain";

export function addBottom(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const parameters = {
    bottomColor: seaParameters.color.value,
    causticColor: "#ffffff",
  };
  const causticGui = gui.addFolder("caustic");
  const material = getNoiseMaterial(causticGui);
  material.uniforms.uMinVisibility = {
    value: seaParameters.visibility.min.value,
  };
  material.uniforms.uMaxVisibility = {
    value: seaParameters.visibility.max.value,
  };
  material.uniforms.uSeaColor = {
    value: new THREE.Color(seaParameters.color.value),
  };
  material.uniforms.uBottomColor = {
    value: new THREE.Color(parameters.bottomColor),
  };
  material.uniforms.uCausticColor = {
    value: new THREE.Color(parameters.causticColor),
  };
  material.uniforms.uTime = { value: 0 };

  seaParameters.color.subscribe((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribe((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribe((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });

  gui
    .addColor(parameters, "bottomColor")
    .name("color")
    .onChange(
      () =>
        (material.uniforms.uBottomColor.value = new THREE.Color(
          parameters.bottomColor
        ))
    );
  causticGui
    .addColor(parameters, "causticColor")
    .name("color")
    .onChange(
      () =>
        (material.uniforms.uCausticColor.value = new THREE.Color(
          parameters.causticColor
        ))
    );

  const geometry = getTerrain(gui.addFolder("terrain"));

  const bottom = new THREE.Mesh(geometry, material);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.z = -15;
  bottom.position.y = -8;

  scene.add(bottom);

  return (time) => {
    material.uniforms.uTime.value = time.elapsed;
  };
}
