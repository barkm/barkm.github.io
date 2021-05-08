#pragma glslify: fogLinear = require(glsl-fog/linear)

uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uIndicesOfRefractionRatio;

varying float vVisibility;
varying vec3 vRefraction;

float getVisibility(const vec3 pos) {
  float distanceFromCamera = distance(pos, cameraPosition);
  return 1.0 - fogLinear(distanceFromCamera, uMinVisibility, uMaxVisibility);
}

float yDisplacement(float x, float z, float t) {
    return 0.1 * (sin(x - 0.5 * t) + cos(z - 0.5 * t));
}

float dYDisplacementDx(float x, float z, float t) {
    return 0.1 * cos(x - 0.5 * t);
}

float dYDisplacementDz(float x, float z, float t) {
    return -0.1 * sin(z - 0.5 * t);
}

vec3 yDisplacementNormal(float x, float z, float t) {
  vec3 tangentX = vec3(1.0, dYDisplacementDx(x, z, t), 0.0);
  vec3 tangentZ = vec3(0.0, dYDisplacementDz(x, z, t), 1.0);
  return normalize(cross(tangentX, tangentZ));
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += yDisplacement(modelPosition.x, modelPosition.z, uTime);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    vec3 indicent = normalize(modelPosition.xyz - cameraPosition);
    vec3 normal = yDisplacementNormal(modelPosition.x, modelPosition.z, uTime);

    gl_Position = projectedPosition;
    vVisibility = getVisibility(modelPosition.xyz);
    vRefraction = refract(indicent, normal, uIndicesOfRefractionRatio);
}