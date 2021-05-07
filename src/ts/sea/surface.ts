import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";

import surfaceVertexShader from "../../shaders/surface/vertex.glsl";
import surfaceFragmentShader from "../../shaders/surface/fragment.glsl";

function getSurface(geometry: THREE.PlaneGeometry) {
  const material = new THREE.ShaderMaterial({
    vertexShader: surfaceVertexShader,
    fragmentShader: surfaceFragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
  });
  const surface = new THREE.Mesh(geometry, material);
  surface.position.z = -15;
  surface.rotation.x = Math.PI / 2;
  return surface;
}

export function addSurface(
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const surfaceGeometry = new THREE.PlaneGeometry(40, 50, 32, 32);

  const surfaceBackground = getSurface(surfaceGeometry);
  surfaceBackground.material.uniforms.uColor = {
    value: new THREE.Color("#8888ff"),
  };
  surfaceBackground.position.y += 0.05;
  scene.add(surfaceBackground);

  const surfaceForeGround = getSurface(surfaceGeometry);
  surfaceForeGround.material.wireframe = true;
  surfaceForeGround.material.uniforms.uColor = {
    value: new THREE.Color("#0000ff"),
  };
  scene.add(surfaceForeGround);

  return (time) => {
    surfaceBackground.material.uniforms.uTime.value = time.elapsed;
    surfaceForeGround.material.uniforms.uTime.value = time.elapsed;
  };
}
