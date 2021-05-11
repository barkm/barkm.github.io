float getWireframeStrength(vec3 barycentricCoordinate, float edgeThickness) {
    vec3 width = fwidth(barycentricCoordinate);
    vec3 edge3 = smoothstep((edgeThickness - 1.0) * width, edgeThickness * width, vBarycentricCoordinate);
    return 1.0 - min(min(edge3.x, edge3.y), edge3.z);
}