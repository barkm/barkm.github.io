attribute vec3 aBarycentricCoordinate;

uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uTime;
uniform float uShimmerFrequency;
uniform float uShimmerSpeed;

varying vec3 vBarycentricCoordinate;
varying float vVisibility;
varying float vShimmer;

#include <skinning_pars_vertex>
#include "../visibility.glsl";

void main() {
    vBarycentricCoordinate = aBarycentricCoordinate;
	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	vVisibility = getVisibility(mvPosition.xyz, uMinVisibility, uMaxVisibility);

 	vShimmer = 1.0;
	 
	#if (SHIMMER == 1)
		vShimmer+= (sin(uShimmerFrequency * position.z + uShimmerSpeed * uTime) + 1.0) / 2.0;
	#endif
}