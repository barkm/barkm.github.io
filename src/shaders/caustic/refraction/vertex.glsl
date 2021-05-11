uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;

varying float vVisibility;
varying vec3 vModelPosition;

#include "../../surface.glsl";
#include "../../visibility.glsl";

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);

    vModelPosition = modelPosition.xyz;
    vModelPosition.y += getYDisplacement(modelPosition.x, modelPosition.z, uTime);
}