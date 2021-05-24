import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gaussian from "gaussian";

import { range, subsample } from "../../../utils";
import { addSubscribable, Subscribable } from "../../../subscribable";
import { TerrainParameters, getElevation } from "../terrain";
import { SeaParameters } from "../../sea";
import {
  Time,
  removeGroup,
  getBoundingBoxFromBufferGeometry,
  setColorAttribute,
} from "../../../three/utils";

import { getMeshMaterial, loadMeshGeometry, MESH_PATHS } from "./mesh";
import {
  ParticlesParameters,
  getParticlesMaterial,
  getParticlesGeometry,
} from "./particles";

async function getColoredCorals(
  loader: GLTFLoader,
  path: string,
  particleParameters: ParticlesParameters,
  colors: Array<THREE.Color>,
  modelMaterial: THREE.ShaderMaterial,
  particlesMaterial: THREE.ShaderMaterial
): Promise<Array<THREE.Group>> {
  const meshGeometry = await loadMeshGeometry(loader, path);
  const boundingBox = getBoundingBoxFromBufferGeometry(meshGeometry);
  return colors.map((color) => {
    const particlesGeometry = getParticlesGeometry(
      particleParameters,
      boundingBox,
      color
    );
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    const coloredMeshGeometry = meshGeometry.clone();
    setColorAttribute(coloredMeshGeometry, color);
    const mesh = new THREE.Mesh(coloredMeshGeometry, modelMaterial);
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
  coral.position.x = gaussian(0, seaParameters.width).ppf(Math.random());
  coral.position.z = THREE.MathUtils.randFloat(-seaParameters.height, 0);
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

export function getCorals(
  seaParameters: SeaParameters,
  terrainParameters: TerrainParameters,
  gui: dat.GUI,
  time: Subscribable<Time>
) {
  const parameters = {
    numCorals: 1000,
    numColors: 5,
  };
  const particleParameters = {
    numPerCoral: new Subscribable(10),
    minSize: new Subscribable(3),
    maxSize: new Subscribable(10),
  };

  const particlesGui = gui.addFolder("particles");

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

  const particlesMaterial = getParticlesMaterial(
    seaParameters,
    particlesGui,
    time
  );
  const coralMaterial = getMeshMaterial(seaParameters, gui);
  const step = Math.floor(100 / parameters.numColors);
  const hues = subsample(range(100), step);
  const colors = hues.map((hue) => new THREE.Color(`hsl(${hue}, 100%, 85%)`));

  const loader = new GLTFLoader();
  const _getColoredCorals = (meshPath: string) => {
    return getColoredCorals(
      loader,
      meshPath,
      particleParameters,
      colors,
      coralMaterial,
      particlesMaterial
    );
  };

  const group = new THREE.Group();

  Promise.all(MESH_PATHS.map(_getColoredCorals))
    .then((coralsPerModel) => coralsPerModel.flat())
    .then((corals) => {
      const removeAndAddCorals = () => {
        removeGroup(group);
        range(parameters.numCorals).map(() => {
          const coral = corals[
            THREE.MathUtils.randInt(0, corals.length - 1)
          ].clone();
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
    });

  return group;
}
