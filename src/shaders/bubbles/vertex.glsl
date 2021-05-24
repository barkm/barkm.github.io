uniform float uMinVisibility;
uniform float uMaxVisibility;
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
    vec3 bubblePosition = position;

    bubblePosition.x += uNoiseAmplitude * snoise4(uNoiseFrequency * vec4(bubblePosition.xyz, uTime));
    bubblePosition.z += uNoiseAmplitude * snoise4(-uNoiseFrequency * vec4(bubblePosition.xyz, uTime));
    bubblePosition.y += uSpeed * uTime;
    bubblePosition.y = mod(bubblePosition.y, uMaxHeight);

	vec4 modelPosition = modelMatrix * vec4(bubblePosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;
    gl_PointSize = uSize * bubblePosition.y / uMaxHeight;
    gl_PointSize *= (uScale / -viewPosition.z);

	vVisibility = getVisibility(viewPosition.xyz, uMinVisibility, uMaxVisibility);
    vTransparency = 1.0 - pow(smoothstep(0.0, 1.0, bubblePosition.y / uMaxHeight), uDecayPower);
}