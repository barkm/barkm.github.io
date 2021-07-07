attribute vec3 aBarycentricCoordinate;

uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uTime;
uniform float uShimmerFrequency;
uniform float uShimmerSpeed;
uniform float uIsDay;
uniform vec3 uSeaColor;
uniform vec3 uColor;


varying vec3 vBarycentricCoordinate;
varying vec3 vColor;

#include <skinning_pars_vertex>
#include "../visibility.glsl";

void main() {
    vBarycentricCoordinate = aBarycentricCoordinate;
	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	#include <project_vertex>

	float visibility = getVisibility(mvPosition.xyz, uMinVisibility, uMaxVisibility);
	float shimmer = 0.75 + (sin(uShimmerFrequency * position.z + uShimmerSpeed * uTime) + 1.0) / 2.0;
	vec3 shimmerColor = shimmer * uColor;
	vec3 targetColor = mix(shimmerColor, uColor, uIsDay);
    	vColor = mix(uSeaColor, targetColor, visibility);
}