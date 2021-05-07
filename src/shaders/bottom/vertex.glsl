#pragma glslify: fogLinear = require(glsl-fog/linear)

uniform float uTime;

varying vec2 vUv;
varying float vVisibility;

float getVisibility(const float dist, const float minDist, const float maxDist) {
  return 1.0 - fogLinear(dist, minDist, maxDist);
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    float distanceFromCamera = distance(modelPosition.xyz, cameraPosition);
    vVisibility = 1.0 - fogLinear(0.3 * distanceFromCamera, 1.0, 10.0);

    vUv = uv;
}