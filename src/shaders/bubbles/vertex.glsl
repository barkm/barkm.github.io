uniform float uMinVisibility;
uniform float uMaxVisibility;
uniform float uDepth;
uniform float uMaxHeight;
uniform float uTime;
uniform float uSpeed;
uniform float uNoiseAmplitude;
uniform float uNoiseFrequency;
uniform float uSize;
uniform float uScale;
uniform float uDecayPower;

varying float vVisibility;
varying float vTransparency;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d) 
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d) 
#include "../visibility.glsl";

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.x += uNoiseAmplitude * snoise4(uNoiseFrequency * vec4(modelPosition.xyz, uTime));
    modelPosition.z += uNoiseAmplitude * snoise4(-uNoiseFrequency * vec4(modelPosition.xyz, uTime));
    modelPosition.y += uSpeed * uTime;
    modelPosition.y = mod(modelPosition.y + uDepth, uMaxHeight) - uDepth;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;
    gl_PointSize = uSize * (modelPosition.y + uDepth) / uMaxHeight;
    gl_PointSize *= (uScale / -viewPosition.z);

	vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);
    vTransparency = 1.0 - pow(smoothstep(0.0, 1.0, (modelPosition.y + uDepth) / uMaxHeight), uDecayPower);
}