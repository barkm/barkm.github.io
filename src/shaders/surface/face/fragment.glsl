#pragma glslify: faceNormal = require('glsl-face-normal')

uniform vec3 uSeaColor;
uniform vec3 uSkyColor;
uniform float uIndicesOfRefractionRatio;

varying float vVisibility;
varying vec3 vModelPosition;

vec3 getRefaction() {
    vec3 normal = faceNormal(vModelPosition);
    vec3 incident = normalize(vModelPosition - cameraPosition);
    return refract(incident, normal, uIndicesOfRefractionRatio);
}

void main() {
    vec3 refraction = getRefaction();
    vec3 color = mix(uSeaColor, uSkyColor, refraction.y);
    color = mix(uSeaColor, color, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}