import "./style.css"
import * as THREE from "three"
import * as UTILS from "./js/utils"
import * as THREE_UTILS from "./js/three/utils"
import {addTurtle} from "./js/three/models"


const scene = new THREE.Scene()

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const turtle = addTurtle(scene)

const windowSizes = UTILS.getWindowSizes()

const camera = THREE_UTILS.getPerspectiveCamera({fov: 75, near: 1, far: 10}, windowSizes)
camera.position.set(0, 2.5, 4)
camera.lookAt(0, 0, 0)

const renderer = THREE_UTILS.getRenderer(document.querySelector("canvas"), windowSizes)
renderer.render(scene, camera)

const update = THREE_UTILS.getUpdateFunction([
    () => {renderer.render(scene, camera)},
    (time) => {if(turtle.group) {turtle.group.rotation.y = time.elapsedTime * 2 * Math.PI / 20}},
    (time) => {if(turtle.mixer) turtle.mixer.update(time.deltaTime)}
])

update()


