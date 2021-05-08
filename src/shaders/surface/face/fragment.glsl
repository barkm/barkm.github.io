uniform vec3 uSeaColor;
uniform vec3 uSkyColor;
uniform float uIndicesOfRefractionRatio;

varying float vVisibility;
varying vec3 vModelPosition;

void main() {
    vec3 indicent = normalize(vModelPosition - cameraPosition);
    vec3 refraction = refract(indicent, vec3(0.0, 1.0, 0.0), uIndicesOfRefractionRatio);
    float totalReflection = 1.0 - length(refraction);

    vec3 color = mix(uSkyColor, uSeaColor, totalReflection);
    color = mix(uSeaColor, color, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}