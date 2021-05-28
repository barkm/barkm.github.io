#pragma glslify: random = require(glsl-random) 

attribute vec3 aBarycentricCoordinate;

uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uTime;

attribute vec3 aColor;

varying vec3 vBarycentricCoordinate;
varying float vVisibility;
varying vec3 vColor;

#include "../visibility.glsl";

#if (SHIMMER == 1)
    #include "./shimmer.glsl";
#endif

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;

    vBarycentricCoordinate = aBarycentricCoordinate;
	vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);


    vColor = aColor;

    #if (SHIMMER == 1)
        vColor *= getShimmer();
    #endif
}