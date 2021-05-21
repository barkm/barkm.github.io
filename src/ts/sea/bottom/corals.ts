import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { range, randomUniformInt, randomUniform } from "../../utils";
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
  const localPositions = new Float32Array(3 * count);
  const boundingBoxSize = new THREE.Vector3();
  boundingBox.getSize(boundingBoxSize);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = randomUniform(boundingBox.min.x, boundingBox.max.x);
    positions[i + 1] = randomUniform(boundingBox.min.y, boundingBox.max.y);
    positions[i + 2] = randomUniform(boundingBox.min.z, boundingBox.max.z);
    localPositions[i] = positions[i] / boundingBoxSize.x;
    localPositions[i + 1] = positions[i + 1] / boundingBoxSize.y;
    localPositions[i + 2] = positions[i + 2] / boundingBoxSize.z;
  }
  return {
    position: new THREE.BufferAttribute(positions, 3),
    localPosition: new THREE.BufferAttribute(localPositions, 3),
  };
}

function getParticleColorAttribute(count: number, color: THREE.Color) {
  const colors = new Float32Array(3 * count);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  return new THREE.BufferAttribute(colors, 3);
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

function getParticles(
  parameters: ParticlesParameters,
  boundingBox: THREE.Box3,
  color: THREE.Color,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.BufferGeometry();
  const setPositionAttribute = () => {
    const position = getParticlePositionAttribute(
      parameters.numPerCoral.value,
      boundingBox
    );
    geometry.setAttribute("position", position.position);
    geometry.setAttribute("aLocalPosition", position.localPosition);
  };
  const setColorPosition = () => {
    geometry.setAttribute(
      "aColor",
      getParticleColorAttribute(parameters.numPerCoral.value, color)
    );
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
  const setAttributes = () => {
    setPositionAttribute();
    setColorPosition();
    setSizeAttribute();
  };
  setAttributes();

  parameters.numPerCoral.subscribeOnFinishChange(setAttributes);
  parameters.minSize.subscribeOnFinishChange(setSizeAttribute);
  parameters.maxSize.subscribeOnFinishChange(setSizeAttribute);

  return new THREE.Points(geometry, material);
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

function getCoral(
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  material: THREE.ShaderMaterial,
  color: THREE.Color,
  geometry: THREE.BufferGeometry
) {
  const colors = new Float32Array(
    geometry.getAttribute("position").array.length
  );
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const coral = new THREE.Mesh(geometry!, material);
  const scale = 0.3 * Math.random() + 1;
  coral.scale.set(scale, scale, scale);
  coral.rotateY(2 * Math.PI * Math.random());
  coral.position.x = seaParameters.width * (Math.random() - 0.5);
  coral.position.z = -seaParameters.height * Math.random();

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

  return coral;
}

function removeGroup(group: THREE.Group): void {
  const toRemove: Array<THREE.Mesh | THREE.Points> = [];
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((mesh) => group.remove(mesh));
}

async function loadCoralGeometry(
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

function loadCoralGeometries() {
  const loader = new GLTFLoader();
  const promise1 = loadCoralGeometry(loader, coralModel1);
  const promise2 = loadCoralGeometry(loader, coralModel2);
  return Promise.all([promise1, promise2]);
}

export function addCorals(
  parent: THREE.Scene | THREE.Group,
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  gui: dat.GUI
): (t: Time) => void {
  const coralParameters = {
    numCorals: 1500,
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

  loadCoralGeometries().then((geometries) => {
    const coralGroup = new THREE.Group();
    const particlesGroup = new THREE.Group();

    const removeAndAddCorals = () => {
      removeGroup(coralGroup);
      removeGroup(particlesGroup);
      const corals = range(coralParameters.numCorals).map(() => {
        const color = new THREE.Color(`hsl(${100 * Math.random()}, 100%, 85%)`);
        const coralIndex = randomUniformInt(0, geometries.length);
        const coral = getCoral(
          seaParameters,
          terrainParameters,
          coralMaterial,
          color,
          geometries[coralIndex].clone()
        );
        const particles = getParticles(
          particleParameters,
          new THREE.Box3().setFromObject(coral),
          color,
          particlesMaterial.material
        );
        return { coral, particles };
      });
      corals.map((coral) => {
        coralGroup.add(coral.coral);
        particlesGroup.add(coral.particles);
      });
    };

    let prevHeightOffset = 0;
    const updateHeightOffset = (offset: number) => {
      particlesGroup.translateY(offset - prevHeightOffset);
      prevHeightOffset = offset;
    };
    updateHeightOffset(particleParameters.heightOffset.value);
    particleParameters.heightOffset.subscribeOnChange(updateHeightOffset);

    let prevDepth = 0;
    const updateDepth = (depth: number) => {
      coralGroup.translateY(prevDepth - depth);
      particlesGroup.translateY(prevDepth - depth);
      prevDepth = depth;
    };
    updateDepth(seaParameters.depth.value);
    seaParameters.depth.subscribeOnChange(updateDepth);

    gui
      .add(coralParameters, "numCorals")
      .min(0)
      .max(4000)
      .step(100)
      .onFinishChange(removeAndAddCorals);
    removeAndAddCorals();
    parent.add(coralGroup);
    parent.add(particlesGroup);
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
