precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uMatrixSize;
uniform float uLevels;
uniform float uPixelSize;
uniform int uNot;
uniform int uRgb;

uniform vec4 uDryWet;

float bayer2(vec2 a)
{
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a)
{
    return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a)
{
    return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

float bayer16(vec2 a)
{
    return bayer8(0.5 * a) * 0.25 + bayer2(a);
}

vec2 mapCoord( vec2 coord )
{
    coord *= uInputSize.xy;
    coord += uInputSize.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= uInputSize.zw;
    coord /= uInputSize.xy;

    return coord;
}

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);

    float pixelSize = max(uPixelSize, 1.0);

    vec2 pixelCoord = mapCoord(vTextureCoord);
    vec2 blockCoord = (floor(pixelCoord / vec2(pixelSize)) * vec2(pixelSize)) + (pixelSize / 2.0);

    vec4 tex = texture(uTexture, unmapCoord(blockCoord));

    vec2 blockIndex = floor(pixelCoord / vec2(pixelSize));

    float threshold;
    if (uMatrixSize <= 2.0) {
        threshold = bayer2(blockIndex);
    } else if (uMatrixSize <= 4.0) {
        threshold = bayer4(blockIndex);
    } else if (uMatrixSize <= 8.0) {
        threshold = bayer8(blockIndex);
    } else {
        threshold = bayer16(blockIndex);
    }

    float levels = max(uLevels, 2.0);
    float scale = levels - 1.0;

    vec3 dithered;
    if (uRgb == 1) {
        dithered.r = clamp(floor(tex.r * scale + threshold), 0.0, scale) / scale;
        dithered.g = clamp(floor(tex.g * scale + threshold), 0.0, scale) / scale;
        dithered.b = clamp(floor(tex.b * scale + threshold), 0.0, scale) / scale;
    } else {
        float gray = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));
        float d = clamp(floor(gray * scale + threshold), 0.0, scale) / scale;
        dithered = vec3(d);
    }

    if (uNot == 1) {
        dithered = 1.0 - dithered;
    }

    vec4 dtex = vec4(dithered, tex.a);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * dtex;
}
