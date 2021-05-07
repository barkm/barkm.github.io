import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";

import surfaceVertexShader from "../../shaders/surface/vertex.glsl";
import surfaceFragmentShader from "../../shaders/surface/fragment.glsl";

import { SeaParameters } from "./sea";

function getSurface(
  seaParameters: SeaParameters,
  geometry: THREE.PlaneGeometry
) {
  const material = new THREE.ShaderMaterial({
    vertexShader: surfaceVertexShader,
    fragmentShader: surfaceFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
    },
    transparent: true,
  });
  const surface = new THREE.Mesh(geometry, material);
  surface.position.z = -15;
  surface.rotation.x = Math.PI / 2;

  seaParameters.color.subscribe((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  seaParameters.visibility.min.subscribe((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribe((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });

  return surface;
}

export function addSurface(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const parameters = {
    faceColor: "#8888ff",
    edgeColor: "#0000ff",
  };

  const surfaceGeometry = new THREE.PlaneGeometry(40, 50, 32, 32);

  const surfaceBackground = getSurface(seaParameters, surfaceGeometry);
  surfaceBackground.material.uniforms.uColor = {
    value: new THREE.Color(parameters.faceColor),
  };
  surfaceBackground.position.y += 0.05;
  scene.add(surfaceBackground);

  const surfaceForeGround = getSurface(seaParameters, surfaceGeometry);
  surfaceForeGround.material.wireframe = true;
  surfaceForeGround.material.uniforms.uColor = {
    value: new THREE.Color(parameters.edgeColor),
  };
  scene.add(surfaceForeGround);

  gui.addColor(parameters, "faceColor").onChange(() => {
    surfaceBackground.material.uniforms.uColor.value = new THREE.Color(
      parameters.faceColor
    );
  });
  gui.addColor(parameters, "edgeColor").onChange(() => {
    surfaceForeGround.material.uniforms.uColor.value = new THREE.Color(
      parameters.edgeColor
    );
  });

  return (time) => {
    surfaceBackground.material.uniforms.uTime.value = time.elapsed;
    surfaceForeGround.material.uniforms.uTime.value = time.elapsed;
  };
}
