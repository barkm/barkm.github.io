import "./style.css"
import * as THREE from "three"
import * as UTILS from "./js/utils"
import * as THREE_UTILS from "./js/three"


const scene = new THREE.Scene()
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial()
)
scene.add(mesh)

const windowSizes = UTILS.getWindowSizes()

const camera = new THREE.PerspectiveCamera(75, windowSizes.width / windowSizes.height, 0.1, 100)
camera.position.set(0, 0, 2)

const renderer = THREE_UTILS.getRenderer(document.querySelector("canvas"), windowSizes)
renderer.render(scene, camera)

const update = THREE_UTILS.getUpdateFunction([
    () => {renderer.render(scene, camera)},
    (elapsedTime) => {mesh.rotation.z = elapsedTime; mesh.rotation.x = elapsedTime}
])

update()


