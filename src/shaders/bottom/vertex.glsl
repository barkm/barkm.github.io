#pragma glslify: fogLinear = require(glsl-fog/linear)

uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform bool uShowCaustic;

varying float vVisibility;

#include "../visibility.glsl";

varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);

    if (uShowCaustic) {
        vUv = uv;
    }
}