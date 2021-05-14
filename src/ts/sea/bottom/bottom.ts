import * as THREE from "three";

import * as THREE_UTILS from "../../three/utils";
import { SeaParameters } from "../sea";

import { getNoiseMaterial } from "./caustic/noise";
import { getTerrain } from "./terrain";
import { addCorals } from "./corals";

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

  const terrain = getTerrain(gui.addFolder("terrain"));

  const bottom = new THREE.Mesh(terrain.geometry, material);
  bottom.position.y = -seaParameters.depth.value;
  seaParameters.depth.subscribe((d) => (bottom.position.y = -d));

  scene.add(bottom);

  addCorals(scene, seaParameters, terrain.parameters);

  return (time) => {
    material.uniforms.uTime.value = time.elapsed;
  };
}
