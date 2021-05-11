#pragma glslify: fogLinear = require(glsl-fog/linear)

float getVisibility(const vec3 viewPosition, float minVisibleDistance, float maxVisibleDistance) {
  return 1.0 - fogLinear(length(viewPosition), minVisibleDistance, maxVisibleDistance);
}