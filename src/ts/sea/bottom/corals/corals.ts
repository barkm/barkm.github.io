import * as THREE from "three";

import {
  range,
  randomUniformInt,
  randomUniform,
  cartesian,
  subsample,
} from "../../../utils";
import { addSubscribable, Subscribable } from "../../../subscribable";
import { TerrainParameters, getElevation } from "../terrain";
import { SeaParameters } from "../../sea";
import {
  Time,
  removeGroup,
  getBoundingBoxFromBufferGeometry,
  setColorAttribute,
} from "../../../three/utils";

import { loadMeshGeometries, getMeshMaterial } from "./mesh";
import {
  ParticlesParameters,
  getParticlesMaterial,
  getParticlesGeometry,
} from "./particles";

async function getColoredCoralGeometries(
  particleParameters: ParticlesParameters,
  colors: Array<THREE.Color>
) {
  const meshGeometries = await loadMeshGeometries();
  return cartesian(meshGeometries, colors).map((product) => {
    const meshGeometry = product[0].clone();
    const color = product[1];
    const boundingBox = getBoundingBoxFromBufferGeometry(meshGeometry);
    const particlesGeometry = getParticlesGeometry(
      particleParameters,
      boundingBox,
      color
    );
    setColorAttribute(meshGeometry, color);
    return { meshGeometry, particlesGeometry };
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
    const mesh = new THREE.Mesh(geometry.meshGeometry, modelMaterial);
    const particles = new THREE.Points(
      geometry.particlesGeometry,
      particlesMaterial
    );
    return new THREE.Group().add(mesh, particles);
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
  const parameters = {
    numCorals: 2000,
    numColors: 5,
  };
  const particleParameters = {
    numPerCoral: new Subscribable(10),
    minSize: new Subscribable(3),
    maxSize: new Subscribable(10),
  };

  const particlesGui = gui.addFolder("particles");

  const particlesMaterial = getParticlesMaterial(seaParameters, particlesGui);
  const coralMaterial = getMeshMaterial(seaParameters, gui);
  const step = Math.floor(100 / parameters.numColors);
  const hues = subsample(range(100), step);
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
      range(parameters.numCorals).map(() => {
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
      .add(parameters, "numCorals")
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
  addSubscribable(particlesGui, particleParameters.minSize, "minSize", 0, 10);
  addSubscribable(particlesGui, particleParameters.maxSize, "maxSize", 0, 10);

  return particlesMaterial.update;
}
