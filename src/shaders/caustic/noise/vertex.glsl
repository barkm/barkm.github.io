#include "../../precision.glsl";

#pragma glslify: fogLinear = require(glsl-fog/linear)

uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;

varying vec2 vUv;
varying float vVisibility;

#include "../../visibility.glsl";

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);
    vUv = uv;
}