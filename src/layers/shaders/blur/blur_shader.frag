in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform float uRadius;
uniform int uIgnoreAlpha;
uniform vec4 uDryWet;

const float Pi = 6.28318530718;
const float uQuality = 4.0;
const float Directions = 16.0;
const float stepSize = Pi / Directions;
const float qualityStep = 1.0 / uQuality;

void main() {
    vec4 oTex = texture(uTexture, vTextureCoord);
    vec2 radius = vec2(uRadius) / uInputSize.xy;

    vec4 color = oTex;

    for (float d = 0.0; d < Pi; d += stepSize) {
        for (float i = qualityStep; i < 1.001; i += qualityStep) {
            vec2 blurCoord = vTextureCoord + vec2(cos(d), sin(d)) * radius * i;
            vec4 sampleTex = texture(uTexture, blurCoord);

            color.r += sampleTex.r;
            color.g += sampleTex.g;
            color.b += sampleTex.b;

            if (uIgnoreAlpha == 1) {
                color.a += 1.0;
            } else if (
                blurCoord.x < 0.0 ||
                blurCoord.x >= 0.99 ||
                blurCoord.y < 0.0 ||
                blurCoord.y >= 0.99
            ) {
                color.a += oTex.a;
            } else {
                color.a += sampleTex.a;
            }
        }
    }

    color /= uQuality * Directions + 1.0;
    gl_FragColor = (1.0 - uDryWet) * oTex + uDryWet * color;
}
