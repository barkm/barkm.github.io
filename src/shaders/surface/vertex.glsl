#include "../precision.glsl";

#pragma glslify: fogLinear = require(glsl-fog/linear)

attribute vec3 aBarycentricCoordinate;

uniform float uTime;
uniform float uMinVisibility;
uniform float uMaxVisibility;

varying float vVisibility;
varying vec3 vModelPosition;
varying vec3 vBarycentricCoordinate;

#include "../surface.glsl";
#include "../visibility.glsl";

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += getYDisplacement(modelPosition.x, modelPosition.z, uTime);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);
    vModelPosition = modelPosition.xyz;
    vBarycentricCoordinate = aBarycentricCoordinate;
}