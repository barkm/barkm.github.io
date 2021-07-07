float getYDisplacement(float x, float z, float t) {
    return 0.1 * (sin(x - 0.5 * t) + cos(z - 0.5 * t));
}