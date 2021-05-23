uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uTime;
uniform float uSpeed;
uniform float uNoiseAmplitude;
uniform float uNoiseFrequency;
uniform float uScale;

attribute float aSize;
attribute vec3 aColor;

varying float vVisibility;
varying vec3 vColor;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d) 
#include "../../visibility.glsl";

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.x += uNoiseAmplitude * snoise4(vec4(uNoiseFrequency * position.xyz, uSpeed * uTime));
    modelPosition.y += uNoiseAmplitude * snoise4(vec4(uNoiseFrequency * position.zxy, uSpeed * uTime));
    modelPosition.z += uNoiseAmplitude * snoise4(vec4(uNoiseFrequency * position.yxz, uSpeed * uTime));

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;
    gl_PointSize = aSize;
    gl_PointSize *= (uScale / -viewPosition.z);

	vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);
    vColor = aColor;
}