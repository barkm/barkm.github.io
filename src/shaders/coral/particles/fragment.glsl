uniform vec3 uSeaColor;
uniform float uRadius;

varying float vVisibility;
varying vec3 vColor;

void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - step(0.5, strength);
    vec3 color = mix(uSeaColor, vColor, vVisibility);
    gl_FragColor = vec4(color, strength);
}
