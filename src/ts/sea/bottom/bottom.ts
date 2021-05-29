import * as THREE from "three";

import * as THREE_UTILS from "../../three/utils";
import { SeaParameters } from "../sea";

import { getTerrain } from "./terrain";
import { getCorals } from "./corals/corals";
import { getBubbles } from "./bubbles";
import { Subscribable } from "../../subscribable";

import vertexShader from "../../../shaders/bottom/vertex.glsl";
import bottomFragmentShader from "../../../shaders/bottom/fragment.glsl";

function getMaterial(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  day: boolean
): THREE.ShaderMaterial {
  const parameters = {
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
      uMinVisibility: {
        value: seaParameters.visibility.min.value,
      },
      uMaxVisibility: {
        value: seaParameters.visibility.max.value,
      },
      uSeaColor: {
        value: new THREE.Color(seaParameters.color.value),
      },
      uCausticColor: {
        value: new THREE.Color(parameters.causticColor),
      },
      uTime: { value: 0 },
    },
    defines: {
      CAUSTIC: day ? "1" : "0",
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
    .addColor(parameters, "causticColor")
    .onChange(
      () =>
        (material.uniforms.uCausticColor.value = new THREE.Color(
          parameters.causticColor
        ))
    );

  return material;
}

export function getBottom(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<THREE_UTILS.Time>,
  day: boolean
) {
  const material = getMaterial(seaParameters, gui.addFolder("material"), day);

  const group = new THREE.Group();

  const terrainGui = gui.addFolder("terrain");
  const terrain = getTerrain(seaParameters, terrainGui);

  const bottom = new THREE.Mesh(terrain.geometry, material);
  bottom.position.y = -seaParameters.depth.value;
  seaParameters.depth.subscribeOnChange((d) => (bottom.position.y = -d));
  group.add(bottom);
  THREE_UTILS.addVisibilityToggle(terrainGui, bottom, group, "visible");

  const coralGui = gui.addFolder("corals");
  const corals = getCorals(
    seaParameters,
    terrain.parameters,
    coralGui,
    time,
    day
  );
  group.add(corals);
  THREE_UTILS.addVisibilityToggle(coralGui, corals, group, "visible");

  if (day) {
    const bubblesGui = gui.addFolder("bubbles");
    const bubbles = getBubbles(seaParameters, bubblesGui, time);
    group.add(bubbles);
    THREE_UTILS.addVisibilityToggle(bubblesGui, bubbles, group, "visible");
  }

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return group;
}
