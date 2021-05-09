#pragma glslify: fogLinear = require(glsl-fog/linear)

float getVisibility(const vec3 pos, float minVisibleDistance, float maxVisibleDistance) {
  float distanceFromCamera = distance(pos, cameraPosition);
  return 1.0 - fogLinear(distanceFromCamera, minVisibleDistance, maxVisibleDistance);
}

float getYDisplacement(float x, float z, float t) {
    return 0.1 * (sin(x - 0.5 * t) + cos(z - 0.5 * t));
}