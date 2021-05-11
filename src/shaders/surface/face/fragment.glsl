#define REFRACTIVE_INDEX_WATER 1.333

#pragma glslify: faceNormal = require('glsl-face-normal')

uniform vec3 uSeaColor;
uniform vec3 uSkyColor;
uniform vec3 uEdgeColor;
uniform float uEdgeThickness;

varying float vVisibility;
varying vec3 vModelPosition;
varying vec3 vBarycentricCoordinate;

vec3 getRefaction() {
    vec3 normal = faceNormal(vModelPosition);
    vec3 incident = normalize(vModelPosition - cameraPosition);
    return refract(incident, normal, REFRACTIVE_INDEX_WATER);
}

void main() {
    vec3 refraction = getRefaction();
    vec3 color = mix(uSeaColor, uSkyColor, refraction.y);

    vec3 w = fwidth(vBarycentricCoordinate);
    vec3 edge3 = smoothstep((uEdgeThickness - 1.0) * w, uEdgeThickness * w, vBarycentricCoordinate);
    float edge = 1.0 - min(min(edge3.x, edge3.y), edge3.z);
    color = mix(color, uEdgeColor, edge);

    color = mix(uSeaColor, color, vVisibility);

    gl_FragColor = vec4(color, 1.0);
}