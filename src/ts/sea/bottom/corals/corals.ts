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

export interface ShimmerParameters {
  pulse: {
    offTime: Subscribable<number>;
    rampTime: Subscribable<number>;
    onTime: Subscribable<number>;
  };
  flicker: {
    speed: Subscribable<number>;
    amplitude: Subscribable<number>;
  };
}

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
  separation: number,
  spread: number,
  coral: THREE.Group
) {
  const scale = 0.3 * Math.random() + 1;
  coral.scale.set(scale, scale, scale);
  coral.rotateY(2 * Math.PI * Math.random());

  const mu = Math.random() < 0.5 ? -separation / 2 : separation / 2;

  coral.position.x = gaussian(mu, spread * seaParameters.width).ppf(
    Math.random()
  );
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
  time: Subscribable<Time>,
  day: boolean
) {
  const parameters = {
    numCorals: 500,
    numColors: 5,
    separation: 8,
    spread: 1,
  };
  const shimmerParameters = {
    pulse: {
      offTime: new Subscribable(10),
      rampTime: new Subscribable(2.0),
      onTime: new Subscribable(5.0),
    },
    flicker: {
      speed: new Subscribable(5),
      amplitude: new Subscribable(0.2),
    },
  };

  const shimmerGui = gui.addFolder("shimmer");
  const pulseGui = shimmerGui.addFolder("pulse");
  addSubscribable(pulseGui, shimmerParameters.pulse.offTime, "offTime", 0, 40);
  addSubscribable(
    pulseGui,
    shimmerParameters.pulse.rampTime,
    "rampTime",
    0,
    10
  );
  addSubscribable(pulseGui, shimmerParameters.pulse.onTime, "onTime", 0, 20);
  const flickerGui = shimmerGui.addFolder("flicker");
  addSubscribable(
    flickerGui,
    shimmerParameters.flicker.amplitude,
    "amplitude",
    0,
    1.0
  );
  addSubscribable(flickerGui, shimmerParameters.flicker.speed, "speed", 0, 10);

  const particleParameters = {
    numPerCoral: new Subscribable(30),
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
    shimmerParameters,
    particlesGui,
    time,
    day
  );
  const coralMaterial = getMeshMaterial(
    seaParameters,
    shimmerParameters,
    gui,
    time,
    day
  );
  const step = Math.floor(100 / parameters.numColors);
  const hues = subsample(range(100), step);
  const lightness = day ? 85 : 65;
  const colors = hues.map(
    (hue) => new THREE.Color(`hsl(${hue}, 100%, ${lightness}%)`)
  );

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
          placeCoral(
            seaParameters,
            terrainParameters,
            parameters.separation,
            parameters.spread,
            coral
          );
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
      gui
        .add(parameters, "separation")
        .min(0)
        .max(20)
        .onFinishChange(removeAndAddCorals);
      gui
        .add(parameters, "spread")
        .min(0)
        .max(2)
        .onFinishChange(removeAndAddCorals);
      removeAndAddCorals();
    });

  return group;
}
