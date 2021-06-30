uniform float uLineThickness;

varying vec3 vBarycentricCoordinate;
varying vec3 vColor;

#include "../wireframe.glsl";

void main() {
    float wireframeStrength = getWireframeStrength(vBarycentricCoordinate, uLineThickness);
    float strength = gl_FrontFacing ? 0.0 : 0.5;
    gl_FragColor = vec4(vColor, wireframeStrength - strength);
}
