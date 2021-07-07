uniform vec3 uSeaColor;
uniform vec3 uEdgeColor;

varying float vVisibility;
varying vec3 vBarycentricCoordinate;

void main() {
    vec3 color = mix(uSeaColor, uEdgeColor, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}