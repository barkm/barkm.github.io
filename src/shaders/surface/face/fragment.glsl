uniform vec3 uSeaColor;
uniform vec3 uSkyColor;
uniform float uIndicesOfRefractionRatio;

varying float vVisibility;
varying vec3 vModelPosition;

vec3 getRefaction() {
    float dYDisplacementDx = dFdx(vModelPosition.y);
    float dYDisplacementDz = dFdy(vModelPosition.y);
    vec3 tangentX = vec3(1.0, dYDisplacementDx, 0.0);
    vec3 tangentZ = vec3(0.0, dYDisplacementDz, 1.0);
    vec3 normal = normalize(cross(tangentX, tangentZ));
    vec3 incident = normalize(vModelPosition - cameraPosition);
    return refract(incident, normal, uIndicesOfRefractionRatio);
}

void main() {
    vec3 refraction = getRefaction();
    vec3 color = mix(uSeaColor, uSkyColor, refraction.y);
    color = mix(uSeaColor, color, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}