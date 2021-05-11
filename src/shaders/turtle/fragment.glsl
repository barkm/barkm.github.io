#include "../precision.glsl";

uniform vec3 uColor;
uniform float uLineThickness;

varying vec3 vBarycentricCoordinate;

#include "../wireframe.glsl";

void main() {
    float wireframeStrength = getWireframeStrength(vBarycentricCoordinate, uLineThickness);
    float strength = gl_FrontFacing ? 0.0 : 0.5;
    gl_FragColor = vec4(uColor, wireframeStrength - strength);
}
