import * as THREE from "three";

import * as THREE_UTILS from "../../three/utils";
import { SeaParameters } from "../sea";

import { getCausticMaterial } from "./caustic";
import { getTerrain } from "./terrain";
import { getCorals } from "./corals/corals";
import { getBubbles } from "./bubbles";
import { Subscribable } from "../../subscribable";

export function getBottom(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<THREE_UTILS.Time>
) {
  const causticGui = gui.addFolder("caustic");
  const material = getCausticMaterial(seaParameters, causticGui);

  const group = new THREE.Group();

  const terrainGui = gui.addFolder("terrain");
  const terrain = getTerrain(seaParameters, terrainGui);

  const bottom = new THREE.Mesh(terrain.geometry, material);
  bottom.position.y = -seaParameters.depth.value;
  seaParameters.depth.subscribeOnChange((d) => (bottom.position.y = -d));
  group.add(bottom);
  THREE_UTILS.addVisibilityToggle(terrainGui, bottom, group, "visible");

  const coralGui = gui.addFolder("corals");
  const corals = getCorals(seaParameters, terrain.parameters, coralGui, time);
  group.add(corals);
  THREE_UTILS.addVisibilityToggle(coralGui, corals, group, "visible");

  const bubblesGui = gui.addFolder("bubbles");
  const bubbles = getBubbles(seaParameters, bubblesGui, time);
  group.add(bubbles);
  THREE_UTILS.addVisibilityToggle(bubblesGui, bubbles, group, "visible");

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return group;
}
