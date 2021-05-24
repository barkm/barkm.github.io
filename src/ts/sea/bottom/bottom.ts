import * as THREE from "three";

import * as THREE_UTILS from "../../three/utils";
import { SeaParameters } from "../sea";

import { getNoiseMaterial } from "./caustic/noise";
import { getTerrain } from "./terrain";
import { getCorals } from "./corals/corals";
import { getBubbles } from "./bubbles";
import { Subscribable } from "../../subscribable";

export function getBottom(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<THREE_UTILS.Time>
) {
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

  const terrain = getTerrain(seaParameters, gui.addFolder("terrain"));

  const bottom = new THREE.Mesh(terrain.geometry, material);
  bottom.position.y = -seaParameters.depth.value;
  seaParameters.depth.subscribeOnChange((d) => (bottom.position.y = -d));

  const corals = getCorals(
    seaParameters,
    terrain.parameters,
    gui.addFolder("corals"),
    time
  );
  const bubbles = getBubbles(seaParameters, gui.addFolder("bubbles"), time);

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return new THREE.Group().add(bottom, corals, bubbles);
}
