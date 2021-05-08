uniform vec3 uEdgeColor;
uniform vec3 uSeaColor;

varying float vVisibility;

void main() {
    vec3 color = mix(uSeaColor, uEdgeColor, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}