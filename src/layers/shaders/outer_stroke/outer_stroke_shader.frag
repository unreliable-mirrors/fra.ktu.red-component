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
        float stroke = 0.0;

        const float Directions = 24.0;
        const float Pi = 6.28318530718;
        const float stepSize = Pi / Directions;

        for (float d = 0.0; d < Pi; d += stepSize) {
            vec2 dir = vec2(cos(d), sin(d));

            for (float i = 0.0; i <= 1.0; i += 0.25) {
                float radius = mix(thickness, thickness * (1.0 + softness), i);
                vec2 samplePos = vTextureCoord + dir * radius * texel;
                float sampleAlpha = texture(uTexture, samplePos).a;
                float sampleCover = smoothstep(
                    uAlphaThreshold - edge,
                    uAlphaThreshold + edge,
                    sampleAlpha
                );
                stroke = max(stroke, sampleCover);
            }
        }

        tex = mix(oTex, uStrokeColor, stroke);
    }

    //DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}
