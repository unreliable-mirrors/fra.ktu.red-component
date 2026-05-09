in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform float uHueRadius;
uniform float uSaturationRadius;
uniform float uLightnessRadius;
uniform int uIgnoreAlpha;
uniform vec4 uDryWet;

const float Pi = 6.28318530718;
const float uQuality = 4.0;
const float Directions = 16.0;
const float stepSize = Pi / Directions;
const float qualityStep = 1.0 / uQuality;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 oTex = texture(uTexture, vTextureCoord);
    vec2 hueRadius = uHueRadius / uInputSize.xy;
    vec2 saturationRadius = uSaturationRadius / uInputSize.xy;
    vec2 lightnessRadius = uLightnessRadius / uInputSize.xy;
    vec2 alphaRadius = (hueRadius + saturationRadius + lightnessRadius) / 3.0;

    vec4 color = oTex;
    color.xyz = rgb2hsv(color.xyz);

    for (float d = 0.0; d < Pi; d += stepSize) {
        for (float i = qualityStep; i < 1.001; i += qualityStep) {
            vec2 hueCoord = vTextureCoord + vec2(cos(d), sin(d)) * hueRadius * i;
            vec2 saturationCoord = vTextureCoord + vec2(cos(d), sin(d)) * saturationRadius * i;
            vec2 lightnessCoord = vTextureCoord + vec2(cos(d), sin(d)) * lightnessRadius * i;
            vec2 alphaCoord = vTextureCoord + vec2(cos(d), sin(d)) * alphaRadius * i;

            color.x += rgb2hsv(texture(uTexture, hueCoord).xyz).x;
            color.y += rgb2hsv(texture(uTexture, saturationCoord).xyz).y;
            color.z += rgb2hsv(texture(uTexture, lightnessCoord).xyz).z;

            if (uIgnoreAlpha == 1) {
                color.a += 1.0;
            } else if (
                alphaCoord.x < 0.0 ||
                alphaCoord.x >= 0.99 ||
                alphaCoord.y < 0.0 ||
                alphaCoord.y >= 0.99
            ) {
                color.a += oTex.a;
            } else {
                color.a += texture(uTexture, alphaCoord).a;
            }
        }
    }

    color /= uQuality * Directions + 1.0;
    color.xyz = hsv2rgb(color.xyz);

    gl_FragColor = (1.0 - uDryWet) * oTex + uDryWet * color;
}
