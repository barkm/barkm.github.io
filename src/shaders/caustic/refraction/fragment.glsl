#define REFRACTIVE_INDEX_WATER 1.333

#include "../../precision.glsl";

#pragma glslify: faceNormal = require('glsl-face-normal')

uniform vec3 uBottomColor;
uniform vec3 uCausticColor;
uniform float uCausticStrength;
uniform vec3 uSeaColor;
uniform float uTime;
uniform float uDistanceToSurface;

varying float vVisibility;
varying vec3 vModelPosition;

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

vec3 getNormal(){
    return yDisplacementNormal(vModelPosition.x, vModelPosition.z, uTime);
}

vec3 getRefraction() {
    vec3 normal = getNormal();
    vec3 incident = vec3(0.0, -1.0, 0.0);
    return refract(incident, normal, 1.0 / REFRACTIVE_INDEX_WATER);
}

vec3 getRefractedPosition() {
    vec3 refraction = 1.0 * getRefraction();
    vec3 position = vModelPosition;
    position.xz += (uDistanceToSurface / refraction.y) * refraction.xz;
    return position;
}

float getArea(vec3 position) {
    return length(dFdx(position)) * length(dFdy(position));
}

float getCaustic() {
    return getArea(vModelPosition) / getArea(getRefractedPosition());
}

void main() {
    float caustic = uCausticStrength * getCaustic();
    vec3 color = mix(uBottomColor, uCausticColor, caustic);
    color = mix(uSeaColor, color, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}