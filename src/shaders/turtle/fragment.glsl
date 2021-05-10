uniform vec3 uColor;
uniform float uLineThickness;

varying vec3 vBarycentricCoordinate;

float edgeFactor() {
  vec3 d = fwidth(vBarycentricCoordinate);
  vec3 f = step(d * 1.0, vBarycentricCoordinate);
  return min(min(f.x, f.y), f.z);
}

void main() {
    vec3 w = fwidth(vBarycentricCoordinate);
    vec3 edge3 = smoothstep((uLineThickness - 1.0) * w, uLineThickness * w, vBarycentricCoordinate);
    float edge = 1.0 - min(min(edge3.x, edge3.y), edge3.z);
    float strength = gl_FrontFacing ? 0.0 : 0.5;
    gl_FragColor = vec4(uColor, edge - strength);
}
