#pragma glslify: random = require(glsl-random) 

uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uTime;
uniform float uSpeed;
uniform float uNoiseAmplitude;
uniform float uNoiseFrequency;
uniform float uScale;
uniform float uHeightOffset;
uniform vec3 uSeaColor;
uniform bool uShimmer;

attribute float aSize;
attribute vec3 aColor;

varying float vVisibility;
varying vec4 vColor;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d) 
#include "../../visibility.glsl";

#include "../shimmer.glsl";

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += uHeightOffset;

    modelPosition.x += uNoiseAmplitude * snoise4(vec4(uNoiseFrequency * modelPosition.xyz, uSpeed * uTime));
    modelPosition.y += uNoiseAmplitude * snoise4(vec4(uNoiseFrequency * modelPosition.zxy, uSpeed * uTime));
    modelPosition.z += uNoiseAmplitude * snoise4(vec4(uNoiseFrequency * modelPosition.yxz, uSpeed * uTime));

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;
    gl_PointSize = aSize;
    gl_PointSize *= (uScale / -viewPosition.z);

	vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);

    vColor = vec4(aColor, 1.0);

    if (uShimmer) {
        vColor = mix(vec4(uSeaColor, 0.0), vColor, getShimmer());
    }
}