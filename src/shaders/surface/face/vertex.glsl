#pragma glslify: fogLinear = require(glsl-fog/linear)

uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;

varying float vVisibility;
varying vec3 vModelPosition;

float getVisibility(const vec3 pos) {
  float distanceFromCamera = distance(pos, cameraPosition);
  return 1.0 - fogLinear(distanceFromCamera, uMinVisibility, uMaxVisibility);
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += sin(modelPosition.x - 0.5 * uTime) + cos(modelPosition.z - 0.5 * uTime);
    modelPosition.y *= 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vVisibility = getVisibility(modelPosition.xyz);
    vModelPosition = modelPosition.xyz;
}