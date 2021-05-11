#include "../precision.glsl";

attribute vec3 aBarycentricCoordinate;

uniform float uMinVisibility;
uniform float uMaxVisibility;

varying vec3 vBarycentricCoordinate;
varying float vVisibility;

#include <skinning_pars_vertex>
#include "../visibility.glsl";

void main() {
    vBarycentricCoordinate = aBarycentricCoordinate;
	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	vVisibility = getVisibility(mvPosition.xyz, uMinVisibility, uMaxVisibility);
}