uniform float uTime;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += sin(modelPosition.x - 0.5 * uTime) + sin(modelPosition.z - 0.5 * uTime);
    modelPosition.y *= 0.5;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
}