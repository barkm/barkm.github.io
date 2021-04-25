import * as THREE from "three"

export function getRenderer(canvas, sizes) {
    const renderer = new THREE.WebGLRenderer({canvas: canvas})
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    window.addEventListener("resize", () =>
    {
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    return renderer
}

export function getUpdateFunction(updateFunctions) {
    const clock = new THREE.Clock()
    let previousTime = 0
    const update = () =>
    {
        const elapsedTime = clock.getElapsedTime()
        const deltaTime = elapsedTime - previousTime
        if(updateFunctions) {
            updateFunctions.map((f) => { f(elapsedTime, deltaTime) })
        }
        window.requestAnimationFrame(update)
    }
    return update
}