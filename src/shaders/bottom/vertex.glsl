#pragma glslify: fogLinear = require(glsl-fog/linear)

uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;

varying float vVisibility;

#include "../visibility.glsl";

#if CAUSTIC == 1
    varying vec2 vUv;
#endif

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);

    #if CAUSTIC == 1
        vUv = uv;
    #endif
}