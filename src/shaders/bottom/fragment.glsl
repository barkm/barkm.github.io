#pragma glslify: simplexNoise = require(glsl-noise/simplex/3d) 

uniform vec3 uColor;
uniform float uTime;

varying vec2 vUv;
varying float vVisibility;

float getCausticsMultiplier(vec2 coord, float time) {
    float caustics = simplexNoise(vec3(coord, time));
    caustics = abs(caustics);
    caustics = 1.0 - caustics;
    caustics = pow(caustics, 2.0);
    return caustics;
}

float getCaustics(vec2 coord, float time, int iterations, float timeOffset) {
    float caustics = 1.0;
    for (int i = 0; i < iterations; i++) {
        caustics *= getCausticsMultiplier(coord, timeOffset * float(i) + time);
    }
    return caustics;
}

void main() {

    float caustics = 2.0 * getCaustics(10.0 * vUv, 0.05 * uTime, 3, 100.0);

    const vec3 waterColor = vec3(1.0);
    vec3 color = mix(waterColor, uColor, caustics);
    color = mix(waterColor, color, vVisibility);

    gl_FragColor = vec4(color, 1.0);
}