uniform vec3 uColor;
uniform vec3 uSeaColor;

varying float vVisibility;

void main() {
    vec3 color = mix(uSeaColor, uColor, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}