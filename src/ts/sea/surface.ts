import * as THREE from "three";

import * as THREE_UTILS from "../three/utils";

import surfaceFaceVertexShader from "../../shaders/surface/face/vertex.glsl";
import surfaceFaceFragmentShader from "../../shaders/surface/face/fragment.glsl";
import surfaceEdgeVertexShader from "../../shaders/surface/edge/vertex.glsl";
import surfaceEdgeFragmentShader from "../../shaders/surface/edge/fragment.glsl";

import { SeaParameters } from "./sea";

function getSurface(
  seaParameters: SeaParameters,
  material: THREE.ShaderMaterial,
  geometry: THREE.PlaneGeometry
) {
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

function getFaces(
  seaParameters: SeaParameters,
  surfaceGeometry: THREE.PlaneGeometry,
  gui: dat.GUI
) {
  const parameters = {
    skyColor: "#ffffff",
  };
  const faceMaterial = new THREE.ShaderMaterial({
    vertexShader: surfaceFaceVertexShader,
    fragmentShader: surfaceFaceFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uSkyColor: { value: new THREE.Color(parameters.skyColor) },
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
    },
  });
  const faces = getSurface(seaParameters, faceMaterial, surfaceGeometry);
  faces.position.y += 0.05;

  gui.addColor(parameters, "skyColor").onChange(() => {
    faces.material.uniforms.uSkyColor.value = new THREE.Color(
      parameters.skyColor
    );
  });

  return faces;
}

function getEdges(
  seaParameters: SeaParameters,
  surfaceGeometry: THREE.PlaneGeometry,
  gui: dat.GUI
) {
  const parameters = {
    skyColor: "#ffffff",
    edgeColor: "#0000ff",
  };
  const edgeMaterial = new THREE.ShaderMaterial({
    vertexShader: surfaceEdgeVertexShader,
    fragmentShader: surfaceEdgeFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uEdgeColor: { value: new THREE.Color(parameters.edgeColor) },
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
    },
    wireframe: true,
  });
  const edges = getSurface(seaParameters, edgeMaterial, surfaceGeometry);

  gui.addColor(parameters, "edgeColor").onChange(() => {
    edges.material.uniforms.uEdgeColor.value = new THREE.Color(
      parameters.edgeColor
    );
  });

  return edges;
}

export function addSurface(
  seaParameters: SeaParameters,
  scene: THREE.Scene,
  gui: dat.GUI
): (t: THREE_UTILS.Time) => void {
  const surfaceGeometry = new THREE.PlaneGeometry(40, 50, 32, 32);

  const faces = getFaces(seaParameters, surfaceGeometry, gui);
  scene.add(faces);

  const edges = getEdges(seaParameters, surfaceGeometry, gui);
  THREE_UTILS.addVisibilityToggle(gui, edges, scene, "edges");
  scene.add(edges);

  return (time) => {
    faces.material.uniforms.uTime.value = time.elapsed;
    edges.material.uniforms.uTime.value = time.elapsed;
  };
}
