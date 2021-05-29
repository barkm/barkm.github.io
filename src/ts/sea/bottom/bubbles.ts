import * as THREE from "three";

import { SeaParameters } from "../sea";

import vertexShader from "../../../shaders/bubbles/vertex.glsl";
import fragmentShader from "../../../shaders/bubbles/fragment.glsl";
import { Time } from "../../three/utils";
import { addSubscribable, Subscribable } from "../../subscribable";

interface BubbleParameters {
  numBubbles: number;
  numPillars: number;
  maxHeight: Subscribable<number>;
}

function getPositions(
  seaParameters: SeaParameters,
  parameters: BubbleParameters
): THREE.BufferAttribute {
  const positions = new Float32Array(
    3 * parameters.numBubbles * parameters.numPillars
  );
  for (
    let pillarIndex = 0;
    pillarIndex < parameters.numPillars;
    pillarIndex++
  ) {
    const pillarX = seaParameters.width * (Math.random() - 0.5);
    const pillarZ = -seaParameters.height * (Math.random() - 0.5);
    for (
      let bubbleIndex = 0;
      bubbleIndex < parameters.numBubbles;
      bubbleIndex += 1
    ) {
      const offset = 3 * (bubbleIndex + parameters.numBubbles * pillarIndex);
      const height =
        parameters.maxHeight.value * (bubbleIndex / parameters.numBubbles);
      positions[offset] = pillarX;
      positions[offset + 1] = height + Math.random();
      positions[offset + 2] = pillarZ;
    }
  }
  return new THREE.BufferAttribute(positions, 3);
}

export function getBubbles(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<Time>
) {
  const parameters: BubbleParameters = {
    numBubbles: 5,
    numPillars: 100,
    maxHeight: new Subscribable(5),
  };
  const geometry = new THREE.BufferGeometry();
  const setPositionAttribute = () => {
    geometry.setAttribute("position", getPositions(seaParameters, parameters));
  };
  setPositionAttribute();

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uMaxHeight: { value: parameters.maxHeight.value },
      uDecayPower: { value: 5 },
      uTime: { value: 0 },
      uSpeed: { value: 0.5 },
      uNoiseAmplitude: { value: 0.05 },
      uNoiseFrequency: { value: 0.5 },
      uSize: { value: 10.0 },
      uScale: { value: 10.0 },
      uRadius: { value: 0 },
      uThickness: { value: 0.4 },
    },
    transparent: true,
    precision: "highp",
  });

  const points = new THREE.Points(geometry, material);

  points.position.y -= seaParameters.depth.value;
  seaParameters.depth.subscribeOnChange((depth) => {
    points.position.y = -depth;
  });
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
    .add(parameters, "numBubbles")
    .min(0)
    .max(20)
    .step(1)
    .onFinishChange(setPositionAttribute);
  gui
    .add(parameters, "numPillars")
    .min(0)
    .max(500)
    .step(1)
    .onFinishChange(setPositionAttribute);
  addSubscribable(gui, parameters.maxHeight, "height", 0, 20).onFinishChange(
    setPositionAttribute
  );
  parameters.maxHeight.subscribeOnFinishChange((v) => {
    material.uniforms.uMaxHeight.value = v;
  });

  gui
    .add(material.uniforms.uDecayPower, "value")
    .min(1)
    .max(50)
    .name("decayPower");
  gui.add(material.uniforms.uSpeed, "value").min(0).max(2).name("speed");
  gui
    .add(material.uniforms.uNoiseAmplitude, "value")
    .min(0)
    .max(0.5)
    .name("amplitude");
  gui
    .add(material.uniforms.uNoiseFrequency, "value")
    .min(0)
    .max(2)
    .name("frequency");
  gui.add(material.uniforms.uSize, "value").min(0).max(20).name("size");
  gui.add(material.uniforms.uScale, "value").min(0).max(20).name("scale");
  gui.add(material.uniforms.uRadius, "value").min(0).max(1).name("radius");
  gui
    .add(material.uniforms.uThickness, "value")
    .min(0)
    .max(1)
    .name("thickness");

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return points;
}
