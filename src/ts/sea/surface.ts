import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";
import { setBarycentricCoordinateAttribute } from "../three/barycentric";

import vertexShader from "../../shaders/surface/vertex.glsl";
import fragmentShader from "../../shaders/surface/fragment.glsl";

import { SeaParameters } from "./sea";

function getMaterial(
  seaParameters: SeaParameters,
  gui: dat.GUI
): THREE.ShaderMaterial {
  const parameters = {
    skyColor: "#ffffff",
    edgeColor: "#0000ff",
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
  });

  seaParameters.color.subscribe((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribe((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribe((v) => {
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

export function addSurface(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const material = getMaterial(seaParameters, gui);

  const geometry = new THREE.PlaneGeometry(50, 50, 32, 32);
  setBarycentricCoordinateAttribute(geometry);

  const surface = new THREE.Mesh(geometry, material);
  surface.position.z = -15;
  surface.rotation.x = Math.PI / 2;
  scene.add(surface);

  return (time) => {
    material.uniforms.uTime.value = time.elapsed;
  };
}
