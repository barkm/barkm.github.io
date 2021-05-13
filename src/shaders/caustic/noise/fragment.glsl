#include "../../precision.glsl";

#pragma glslify: simplexNoise = require(glsl-noise/simplex/3d) 

uniform vec3 uBottomColor;
uniform vec3 uCausticColor;
uniform float uCausticStrength;
uniform float uCausticLacunarity;
uniform float uCausticPersistance;
uniform float uCausticScale;
uniform float uCausticSpeed;
uniform int uCausticIterations;
uniform vec3 uSeaColor;
uniform float uTime;

varying vec2 vUv;
varying float vVisibility;

const int maxCausticIterations = 5;

float getCaustic(vec2 coord, float time, int iterations) {
    float totalCaustic = 1.0;
    for (int i = 0; i < maxCausticIterations; i++) {
        if (i >= uCausticIterations) {
            break;
        }
        float frequency = pow(uCausticLacunarity, float(i));
        float amplitude = pow(uCausticPersistance, float(i));
        float caustic = amplitude * simplexNoise(vec3(frequency * coord, frequency * time));
        caustic = 1.0 - abs(caustic);
        totalCaustic *= caustic;
    }
    return totalCaustic;
}

void main() {

    float caustic = uCausticStrength * getCaustic(uCausticScale * (vUv - 0.5), uCausticSpeed * uTime, uCausticIterations);

    vec3 color = mix(uBottomColor, uCausticColor, caustic);
    color = mix(uSeaColor, color, vVisibility);

    gl_FragColor = vec4(color, 1.0);
}