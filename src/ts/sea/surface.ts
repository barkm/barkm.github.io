import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";
import { setBarycentricCoordinateAttribute } from "../three/barycentric";

import vertexShader from "../../shaders/surface/vertex.glsl";
import fragmentShader from "../../shaders/surface/fragment.glsl";

import { SeaParameters } from "./sea";
import { Subscribable } from "../subscribable";

function getMaterial(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  day: boolean
): THREE.ShaderMaterial {
  const parameters = {
    skyColor: "#ffffff",
    edgeColor: day ? "#0000ff" : "#7a7a7a",
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
      uEdgeThickness: { value: 1.0 },
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
    },
    defines: {
      REFRACTION: parameters.useRefraction ? "1" : "0",
    },
    extensions: {
      derivatives: true,
    },
    precision: parameters.useRefraction ? "highp" : "mediump",
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

  gui.addColor(parameters, "skyColor").onChange(() => {
    material.uniforms.uSkyColor.value = new THREE.Color(parameters.skyColor);
  });
  gui.addColor(parameters, "edgeColor").onChange(() => {
    material.uniforms.uEdgeColor.value = new THREE.Color(parameters.edgeColor);
  });

  return material;
}

export function getSurface(
  seaParameters: SeaParameters,
  gui: dat.GUI,
  time: Subscribable<THREE_UTILS.Time>,
  day: boolean
) {
  const material = getMaterial(seaParameters, gui, day);

  const geometry = new THREE.PlaneGeometry(
    seaParameters.width,
    seaParameters.height,
    32,
    (32 * seaParameters.height) / seaParameters.width
  );
  setBarycentricCoordinateAttribute(geometry);

  const surface = new THREE.Mesh(geometry, material);
  surface.position.z = -seaParameters.height / 2;
  surface.rotation.x = Math.PI / 2;

  time.subscribeOnChange((t) => {
    material.uniforms.uTime.value = t.elapsed;
  });

  return surface;
}
