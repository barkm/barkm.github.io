#pragma glslify: simplexNoise = require(glsl-noise/simplex/3d) 

uniform vec3 uCausticColor;
uniform float uCausticStrength;
uniform float uCausticLacunarity;
uniform float uCausticPersistance;
uniform float uCausticScale;
uniform float uCausticSpeed;
uniform int uCausticIterations;
uniform vec3 uSeaColor;
uniform float uTime;

varying float vVisibility;

#if CAUSTIC == 1
varying vec2 vUv;
const int maxCausticIterations = 5;
float getCaustic(vec2 coord, float time, int iterations) {
    float totalCaustic = 1.0;
    for (int i = 0; i < maxCausticIterations; i++) {
        if (i >= iterations) {
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
#endif

void main() {

    vec3 color = uSeaColor;

    #if CAUSTIC == 1
        float caustic = uCausticStrength * getCaustic(uCausticScale * (vUv - 0.5), uCausticSpeed * uTime, uCausticIterations);
        color = mix(color, uCausticColor, caustic);
    #endif

    color = mix(uSeaColor, color, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}