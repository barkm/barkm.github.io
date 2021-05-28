uniform float uPulseOffTime;
uniform float uPulseOnTime;
uniform float uPulseRampTime;
uniform float uFlickerSpeed;
uniform float uFlickerAmplitude;


float getPulse(float time, float offTime, float rampTime, float onTime) {
    float period = offTime + rampTime + onTime + rampTime;
    time = mod(time, period);
    if (time < offTime){return 0.0;};
    if (time < offTime + rampTime){return smoothstep(0.0, 1.0, (time - offTime) / rampTime);};
    if (time < offTime + rampTime + onTime){return 1.0;};
    return 1.0 - smoothstep(0.0, 1.0, 1.0 - (period - time) / rampTime);
}

float getShimmer() {
    float puslePhase = random(vec2(modelMatrix[3][0], modelMatrix[3][2]));
    float pulse = getPulse(100.0 * puslePhase + uTime, uPulseOffTime, uPulseRampTime, uPulseOnTime);

    float flickerPhase = random(vec2(position.xz) + position.y);
    float flicker = (sin(100.0 * flickerPhase + uFlickerSpeed * uTime) / 2.0) - 0.5;
    flicker = flicker * uFlickerAmplitude + (1.0 -  uFlickerAmplitude / 2.0);

    return pulse * flicker;
}