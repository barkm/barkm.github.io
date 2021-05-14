attribute vec3 aBarycentricCoordinate;

uniform float uMinVisibility;
uniform float uMaxVisibility;

varying vec3 vBarycentricCoordinate;
varying float vVisibility;

#include "../visibility.glsl";

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;

    vBarycentricCoordinate = aBarycentricCoordinate;
	vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);
}