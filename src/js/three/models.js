import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import turtleModel from "../../../models/turtle.glb";

export function addTurtle(scene, material) {
  material.skinning = true;
  const gltfLoader = new GLTFLoader();
  let turtle = { mixer: null };
  gltfLoader.load(turtleModel, (gltf) => {
    turtle.group = gltf.scene;
    turtle.mixer = new THREE.AnimationMixer(gltf.scene);
    const action = turtle.mixer.clipAction(gltf.animations[1]);
    action.play();
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = material;
      }
    });
    scene.add(gltf.scene);
  });
  return turtle;
}
