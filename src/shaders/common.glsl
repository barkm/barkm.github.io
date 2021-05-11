#pragma glslify: fogLinear = require(glsl-fog/linear)

float getVisibility(const vec3 viewPosition, float minVisibleDistance, float maxVisibleDistance) {
  return 1.0 - fogLinear(length(viewPosition), minVisibleDistance, maxVisibleDistance);
}

float getYDisplacement(float x, float z, float t) {
    return 0.1 * (sin(x - 0.5 * t) + cos(z - 0.5 * t));
}