uniform vec3 uColor;

varying float vVisibility;

void main() {
    const vec3 waterColor = vec3(1.0);
    vec3 color = mix(waterColor, uColor, vVisibility);
    gl_FragColor = vec4(color, 1.0);
}