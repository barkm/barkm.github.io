uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;

varying float vVisibility;

#include "../../common.glsl";

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += getYDisplacement(modelPosition.x, modelPosition.z, uTime);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vVisibility = getVisibility(modelPosition.xyz, uMinVisibility, uMaxVisibility);
}