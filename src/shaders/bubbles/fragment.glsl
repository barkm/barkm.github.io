#include "../precision.glsl";

uniform vec3 uSeaColor;
uniform float uThickness;
uniform float uRadius;

varying float vVisibility;
varying float vTransparency;

void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = step(uRadius, strength) - step(uRadius + uThickness, strength);
    vec3 color = mix(uSeaColor, vec3(1.0), vVisibility);
    gl_FragColor = vec4(color, vTransparency * strength);
}
