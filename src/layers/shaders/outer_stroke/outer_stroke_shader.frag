in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uDryWet;
uniform vec2 uSize;

uniform vec4 uStrokeColor;
uniform float uThickness;
uniform float uSoftness;
uniform float uAlphaThreshold;

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);
    vec2 texel = 1.0 / uSize;

    float thickness = max(uThickness, 0.0);
    float softness = clamp(uSoftness, 0.0, 1.0);
    float edge = 0.05;

    float ownAlpha = oTex.a;
    float inside = step(uAlphaThreshold, ownAlpha);

    vec4 tex = oTex;

    if (inside < 0.5) {
        float maxRadius = thickness;
        float minDistance = 1000000.0;

        const float Directions = 16.0;
        const float Pi = 6.28318530718;
        const float stepSize = Pi / Directions;
        const float radialSteps = 8.0;

        for (float d = 0.0; d < Pi; d += stepSize) {
            vec2 dir = vec2(cos(d), sin(d));

            float prevRadius = 0.0;
            float prevCover = 0.0;

            for (float j = 1.0; j <= radialSteps; j += 1.0) {
                float radius = maxRadius * j / radialSteps;
                vec2 samplePos = vTextureCoord + dir * radius * texel;
                float cover = smoothstep(
                    uAlphaThreshold - edge,
                    uAlphaThreshold + edge,
                    texture(uTexture, samplePos).a
                );

                if (cover >= 0.5 && prevCover < 0.5) {
                    float t = (0.5 - prevCover) / max(cover - prevCover, 0.0001);
                    float crossing = mix(prevRadius, radius, clamp(t, 0.0, 1.0));
                    minDistance = min(minDistance, crossing);
                    break;
                }

                prevRadius = radius;
                prevCover = cover;
            }
        }

        float fadeStart = max(thickness * (1.0 - softness), 0.0);
        float fadeEnd = thickness;
        float stroke = 1.0 - smoothstep(fadeStart, fadeEnd + 0.001, minDistance);
        stroke = clamp(stroke, 0.0, 1.0);

        tex = mix(oTex, uStrokeColor, stroke);
    }

    //DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}
