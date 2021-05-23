import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
  range,
  randomUniformInt,
  randomUniform,
  cartesian,
  subsample,
} from "../../utils";
import { addSubscribable, Subscribable } from "../../subscribable";
import { TerrainParameters, getElevation } from "./terrain";
import { SeaParameters } from "../sea";
import { setBarycentricCoordinateAttribute } from "../../three/barycentric";
import { loadModel, Time } from "../../three/utils";

import vertexShader from "../../../shaders/coral/vertex.glsl";
import fragmentShader from "../../../shaders/coral/fragment.glsl";
import coralModel1 from "../../../../models/corals/coral1.glb";
import coralModel2 from "../../../../models/corals/coral2.glb";
import particlesVertexShader from "../../../shaders/coral/particles/vertex.glsl";
import particlesFragmentShader from "../../../shaders/coral/particles/fragment.glsl";

interface ParticlesParameters {
  numPerCoral: Subscribable<number>;
  heightOffset: Subscribable<number>;
  minSize: Subscribable<number>;
  maxSize: Subscribable<number>;
}
interface CoralParameters {
  numCorals: number;
  edgeThickness: Subscribable<number>;
}

function getParticlePositionAttribute(count: number, boundingBox: THREE.Box3) {
  const positions = new Float32Array(3 * count);
  const boundingBoxSize = new THREE.Vector3();
  boundingBox.getSize(boundingBoxSize);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = randomUniform(boundingBox.min.x, boundingBox.max.x);
    positions[i + 1] = randomUniform(boundingBox.min.y, boundingBox.max.y);
    positions[i + 2] = randomUniform(boundingBox.min.z, boundingBox.max.z);
  }
  return new THREE.BufferAttribute(positions, 3);
}

function getParticleSizeAttribute(
  count: number,
  minSize: number,
  maxSize: number
) {
  const sizes = new Float32Array(count);
  for (let i = 0; i < sizes.length; i++) {
    sizes[i] = randomUniform(minSize, maxSize);
  }
  return new THREE.BufferAttribute(sizes, 1);
}

function getParticlesMaterial(seaParameters: SeaParameters, gui: dat.GUI) {
  const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uScale: { value: 10.0 },
      uNoiseAmplitude: { value: 0.5 },
      uNoiseFrequency: { value: 1.0 },
      uSpeed: { value: 0.05 },
      uTime: { value: 0 },
    },
    transparent: true,
  });
  seaParameters.visibility.min.subscribeOnChange((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribeOnChange((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });
  seaParameters.color.subscribeOnChange((v) => {
    material.uniforms.uSeaColor.value = new THREE.Color(v);
  });
  const update = (time: Time) => {
    material.uniforms.uTime.value = time.elapsed;
  };

  gui.add(material.uniforms.uScale, "value").min(0).max(20).name("scale");
  gui
    .add(material.uniforms.uNoiseAmplitude, "value")
    .min(0)
    .max(2)
    .name("noiseAmplitude");
  gui
    .add(material.uniforms.uNoiseFrequency, "value")
    .min(0)
    .max(2)
    .name("noiseFrequency");
  gui.add(material.uniforms.uSpeed, "value").min(0).max(0.1).name("speed");

  return { material, update };
}

function getParticlesGeometry(
  parameters: ParticlesParameters,
  boundingBox: THREE.Box3
) {
  const geometry = new THREE.BufferGeometry();
  const setPositionAttribute = () => {
    const position = getParticlePositionAttribute(
      parameters.numPerCoral.value,
      boundingBox
    );
    geometry.setAttribute("position", position);
  };
  const setSizeAttribute = () => {
    geometry.setAttribute(
      "aSize",
      getParticleSizeAttribute(
        parameters.numPerCoral.value,
        parameters.minSize.value,
        parameters.maxSize.value
      )
    );
  };
  setPositionAttribute();
  setSizeAttribute();
  parameters.minSize.subscribeOnFinishChange(setSizeAttribute);
  parameters.maxSize.subscribeOnFinishChange(setSizeAttribute);
  return geometry;
}

function setColorAttribute(geometry: THREE.BufferGeometry, color: THREE.Color) {
  const colors = new Float32Array(3 * geometry.getAttribute("position").count);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
}

function getCoralMaterial(
  seaParameters: SeaParameters,
  parameters: CoralParameters,
  gui: dat.GUI
) {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uMinVisibility: { value: seaParameters.visibility.min.value },
      uMaxVisibility: { value: seaParameters.visibility.max.value },
      uSeaColor: { value: new THREE.Color(seaParameters.color.value) },
      uLineThickness: { value: parameters.edgeThickness.value },
      uTime: { value: 0 },
    },
    side: THREE.DoubleSide,
    alphaToCoverage: true,
    extensions: {
      derivatives: true,
    },
  });

  seaParameters.color.subscribeOnChange((c) => {
    material.uniforms.uSeaColor.value.set(c);
  });
  seaParameters.visibility.min.subscribeOnChange((v) => {
    material.uniforms.uMinVisibility.value = v;
  });
  seaParameters.visibility.max.subscribeOnChange((v) => {
    material.uniforms.uMaxVisibility.value = v;
  });
  parameters.edgeThickness.subscribeOnFinishChange((v) => {
    material.uniforms.uLineThickness.value = v;
  });
  addSubscribable(gui, parameters.edgeThickness, "edgeThickness", 0, 2);

  return material;
}

function removeGroup(group: THREE.Group): void {
  const toRemove: Array<THREE.Mesh | THREE.Points> = [];
  group.traverse((obj) => {
    if (obj instanceof THREE.Group && obj != group) {
      removeGroup(obj);
    }
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((mesh) => group.remove(mesh));
}

async function loadMeshGeometry(
  loader: GLTFLoader,
  path: string
): Promise<THREE.BufferGeometry> {
  const model = await loadModel(loader, path);
  let geometry: THREE.BufferGeometry | null = null;
  model.scene.traverse((obj: any) => {
    if (obj instanceof THREE.Mesh) {
      geometry = obj.geometry;
      setBarycentricCoordinateAttribute(geometry!);
    }
  });
  return geometry!;
}

function loadMeshGeometries() {
  const loader = new GLTFLoader();
  const promise1 = loadMeshGeometry(loader, coralModel1);
  const promise2 = loadMeshGeometry(loader, coralModel2);
  return Promise.all([promise1, promise2]);
}

function getBoundingBoxFromBufferGeometry(geometry: THREE.BufferGeometry) {
  const positionAttribute = geometry.getAttribute(
    "position"
  ) as THREE.BufferAttribute;
  return new THREE.Box3().setFromBufferAttribute(positionAttribute);
}

async function getCoralGeometries(particleParameters: ParticlesParameters) {
  const modelGeometries = await loadMeshGeometries();
  return modelGeometries.map((modelGeometry) => {
    const boundingBox = getBoundingBoxFromBufferGeometry(modelGeometry);
    const particlesGeometry = getParticlesGeometry(
      particleParameters,
      boundingBox
    );
    return {
      modelGeometry,
      particlesGeometry,
    };
  });
}

async function getColoredCoralGeometries(
  particleParameters: ParticlesParameters,
  colors: Array<THREE.Color>
) {
  const geometryTemplates = await getCoralGeometries(particleParameters);
  return cartesian(geometryTemplates, colors).map((product) => {
    const geometryTemplate = product[0];
    const color = product[1];
    const modelGeometry = geometryTemplate.modelGeometry.clone();
    const particlesGeometry = geometryTemplate.particlesGeometry.clone();
    setColorAttribute(modelGeometry, color);
    setColorAttribute(particlesGeometry, color);
    return { modelGeometry, particlesGeometry };
  });
}

async function getCorals(
  particleParameters: ParticlesParameters,
  colors: Array<THREE.Color>,
  modelMaterial: THREE.ShaderMaterial,
  particlesMaterial: THREE.ShaderMaterial
) {
  const geometries = await getColoredCoralGeometries(
    particleParameters,
    colors
  );
  return geometries.map((geometry) => {
    const mesh = new THREE.Mesh(geometry.modelGeometry, modelMaterial);
    const points = new THREE.Points(
      geometry.particlesGeometry,
      particlesMaterial
    );
    return new THREE.Group().add(mesh, points);
  });
}

function placeCoral(
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  coral: THREE.Group
) {
  const scale = 0.3 * Math.random() + 1;
  coral.scale.set(scale, scale, scale);
  coral.rotateY(2 * Math.PI * Math.random());
  coral.position.x = randomUniform(
    -seaParameters.width / 2,
    seaParameters.width / 2
  );
  coral.position.z = randomUniform(-seaParameters.height, 0);
  const setElevation = () => {
    coral.position.y = getElevation(
      coral.position.x,
      coral.position.z,
      terrainParameters
    );
  };
  setElevation();
  terrainParameters.amplitude.subscribeOnFinishChange(setElevation);
  terrainParameters.scale.subscribeOnFinishChange(setElevation);
  terrainParameters.persistence.subscribeOnFinishChange(setElevation);
  terrainParameters.lacunarity.subscribeOnFinishChange(setElevation);
  terrainParameters.octaves.subscribeOnFinishChange(setElevation);
}

export function addCorals(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  gui: dat.GUI
): (t: Time) => void {
  const coralParameters = {
    numCorals: 2000,
    edgeThickness: new Subscribable(1.5),
  };
  const particleParameters = {
    numPerCoral: new Subscribable(10),
    heightOffset: new Subscribable(0.2),
    minSize: new Subscribable(3),
    maxSize: new Subscribable(10),
  };

  const particlesGui = gui.addFolder("particles");

  const particlesMaterial = getParticlesMaterial(seaParameters, particlesGui);
  const coralMaterial = getCoralMaterial(seaParameters, coralParameters, gui);
  const hues = subsample(range(100), 10);
  const colors = hues.map((hue) => new THREE.Color(`hsl(${hue}, 100%, 85%)`));

  getCorals(
    particleParameters,
    colors,
    coralMaterial,
    particlesMaterial.material
  ).then((corals) => {
    const group = new THREE.Group();
    const removeAndAddCorals = () => {
      removeGroup(group);
      range(coralParameters.numCorals).map(() => {
        const coral = corals[randomUniformInt(0, corals.length)].clone();
        placeCoral(seaParameters, terrainParameters, coral);
        group.add(coral);
      });
    };
    group.position.y = -seaParameters.depth.value;
    seaParameters.depth.subscribeOnChange((depth) => {
      group.position.y = -depth;
    });

    gui
      .add(coralParameters, "numCorals")
      .min(0)
      .max(4000)
      .step(100)
      .onFinishChange(removeAndAddCorals);
    removeAndAddCorals();
    parent.add(group);
  });

  addSubscribable(
    particlesGui,
    particleParameters.numPerCoral,
    "numPerCoral",
    0,
    50,
    1
  );
  addSubscribable(
    particlesGui,
    particleParameters.heightOffset,
    "heightOffset",
    0,
    1
  );
  addSubscribable(particlesGui, particleParameters.minSize, "minSize", 0, 10);
  addSubscribable(particlesGui, particleParameters.maxSize, "maxSize", 0, 10);

  return particlesMaterial.update;
}
