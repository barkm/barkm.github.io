#pragma glslify: simplexNoise = require(glsl-noise/simplex/3d) 

uniform vec3 uBottomColor;
uniform vec3 uCausticColor;
uniform float uCausticStrength;
uniform float uCausticOffset;
uniform float uCausticScale;
uniform float uCausticSpeed;
uniform int uCausticIterations;
uniform vec3 uSeaColor;
uniform float uTime;

varying vec2 vUv;
varying float vVisibility;

float getCausticMultiplier(vec2 coord, float time) {
    float caustic = simplexNoise(vec3(coord, time));
    caustic = abs(caustic);
    caustic = 1.0 - caustic;
    caustic = pow(caustic, 2.0);
    return caustic;
}

float getCaustic(vec2 coord, float time, int iterations, float timeOffset) {
    float caustic = 1.0;
    for (int i = 0; i < iterations; i++) {
        caustic *= getCausticMultiplier(coord, timeOffset * float(i) + time);
    }
    return caustic;
}

void main() {

    float caustic = uCausticStrength * getCaustic(uCausticScale * (vUv - 0.5), uCausticSpeed * uTime, uCausticIterations, uCausticOffset);

    vec3 color = mix(uBottomColor, uCausticColor, caustic);
    color = mix(uSeaColor, color, vVisibility);

    gl_FragColor = vec4(color, 1.0);
}