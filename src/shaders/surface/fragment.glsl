#include "../precision.glsl";

#define REFRACTIVE_INDEX_WATER 1.333

#pragma glslify: faceNormal = require('glsl-face-normal')

uniform vec3 uSeaColor;
uniform vec3 uSkyColor;
uniform vec3 uEdgeColor;
uniform float uEdgeThickness;

varying float vVisibility;
varying vec3 vModelPosition;
varying vec3 vBarycentricCoordinate;

#include "../wireframe.glsl";

vec3 getRefaction() {
    vec3 normal = faceNormal(vModelPosition);
    vec3 incident = normalize(vModelPosition - cameraPosition);
    return refract(incident, normal, REFRACTIVE_INDEX_WATER);
}

void main() {
    vec3 refraction = getRefaction();
    vec3 color = mix(uSeaColor, uSkyColor, refraction.y);

    float wireframeStrength = getWireframeStrength(vBarycentricCoordinate, uEdgeThickness);
    color = mix(color, uEdgeColor, wireframeStrength);

    color = mix(uSeaColor, color, vVisibility);

    gl_FragColor = vec4(color, 1.0);
}