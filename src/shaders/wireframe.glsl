float getWireframeStrength(vec3 barycentricCoordinate, float edgeThickness) {
    vec3 width = fwidth(barycentricCoordinate);
    vec3 edge3 = smoothstep(vec3(0.0), edgeThickness * width, barycentricCoordinate);
    return 1.0 - min(min(edge3.x, edge3.y), edge3.z);
}