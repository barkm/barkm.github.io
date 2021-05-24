uniform vec3 uColor;
uniform vec3 uSeaColor;
uniform float uLineThickness;

varying vec3 vBarycentricCoordinate;
varying float vVisibility;
varying vec3 vColor;

#include "../wireframe.glsl";

void main() {
    float wireframeStrength = getWireframeStrength(vBarycentricCoordinate, uLineThickness);
    float strength = gl_FrontFacing ? 0.0 : 0.5;
    vec3 color = mix(uSeaColor, vColor, vVisibility);
    gl_FragColor = vec4(color, wireframeStrength - strength);
}
