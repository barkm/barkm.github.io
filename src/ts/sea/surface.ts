import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";

import vertexShader from "../../shaders/sea/surface/vertex.glsl";
import fragmentShader from "../../shaders/sea/surface/fragment.glsl";

import { SeaParameters } from "./sea";
import { Subscribable } from "../subscribable";

function getMaterial(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  isDay: Subscribable<number>
): THREE.ShaderMaterial {
  let edgeDayColor = new THREE.Color("#0000ff");
  let edgeNightColor = new THREE.Color("#7a7a7a");

  let getColor = (d: number) =>
    new THREE.Color().lerpColors(edgeNightColor, edgeDayColor, d);

  const parameters = {
    skyColor: "#ffffff",
    edgeColor: getColor(isDay.value),
    useRefraction: false,
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uSkyColor: { value: new THREE.Color(parameters.skyColor) },
      uEdgeColor: { value: new THREE.Color(parameters.edgeColor) },
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
    },
    precision: "highp",
    wireframe: true,
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

  isDay.subscribeOnChange(
    (d) => (material.uniforms.uEdgeColor.value = getColor(d))
  );

  gui.addColor(parameters, "skyColor").onChange(() => {
    material.uniforms.uSkyColor.value = new THREE.Color(parameters.skyColor);
  });

  return material;
}

export function getSurface(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<THREE_UTILS.Time>,
  isDay: Subscribable<number>
) {
  const material = getMaterial(seaParameters, gui, isDay);

  const geometry = new THREE.PlaneGeometry(
    seaParameters.width,
    seaParameters.height,
    32,
    (32 * seaParameters.height) / seaParameters.width
  );

  const surface = new THREE.Mesh(geometry, material);
  surface.rotation.x = Math.PI / 2;

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return surface;
}
