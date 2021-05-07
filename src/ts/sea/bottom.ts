import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";

import bottomVertexShader from "../../shaders/bottom/vertex.glsl";
import bottomFragmentShader from "../../shaders/bottom/fragment.glsl";

export function addBottom(scene: THREE.Scene): (t: THREE_UTILS.Time) => void {
  const bottom = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 50),
    new THREE.ShaderMaterial({
      vertexShader: bottomVertexShader,
      fragmentShader: bottomFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color("blue") },
        uTime: { value: 0 },
      },
    })
  );
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = -8;
  scene.add(bottom);
  return (time) => {
    bottom.material.uniforms.uTime.value = time.elapsed;
  };
}
