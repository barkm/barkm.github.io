uniform vec3 uSeaColor;
uniform vec3 uSkyColor;

varying float vVisibility;
varying vec3 vRefraction;

void main() {
    vec3 refraction = vRefraction;
    float totalReflection = 1.0 - length(refraction);

    vec3 color = mix(uSkyColor, uSeaColor, totalReflection);
    color = mix(uSeaColor, color, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}