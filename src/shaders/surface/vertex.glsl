uniform float uTime;

varying float vVisibility;

float getVisibility(const float dist, const float minDist, const float maxDist) {
  return clamp((maxDist - dist) / (maxDist - minDist), 0.0, 1.0);
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += sin(modelPosition.x - 0.5 * uTime) + cos(modelPosition.z - 0.5 * uTime);
    modelPosition.y *= 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    float distanceFromCamera = distance(modelPosition.xyz, cameraPosition);
    vVisibility = getVisibility(0.3 * distanceFromCamera, 1.0, 6.0);
}