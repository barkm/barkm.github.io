#include "../precision.glsl";

attribute vec3 aBarycentricCoordinate;

varying vec3 vBarycentricCoordinate;

#include <skinning_pars_vertex>

void main() {
    vBarycentricCoordinate = aBarycentricCoordinate;
	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
}