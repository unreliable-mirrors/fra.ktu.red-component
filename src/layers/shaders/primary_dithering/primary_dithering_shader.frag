precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uMatrixSize;
uniform float uPixelSize;
uniform int uBlack;
uniform int uWhite;

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

    float white = min(tex.r, min(tex.g, tex.b));
    float maxChannel = max(tex.r, max(tex.g, tex.b));

    float blackAmount = 1.0 - maxChannel;
    float pureAmount = maxChannel - white;

    float sr = tex.r - white;
    float sg = tex.g - white;
    float sb = tex.b - white;
    float saturation = sr + sg + sb;

    vec3 dominantPrimary = vec3(1.0, 0.0, 0.0);
    if (sr >= sg && sr >= sb) {
        dominantPrimary = vec3(1.0, 0.0, 0.0);
    } else if (sg >= sb) {
        dominantPrimary = vec3(0.0, 1.0, 0.0);
    } else {
        dominantPrimary = vec3(0.0, 0.0, 1.0);
    }

    vec3 dithered;
    if (threshold < blackAmount) {
        dithered = uBlack == 1 ? vec3(0.0) : dominantPrimary;
    } else if (threshold < blackAmount + pureAmount) {
        dithered = dominantPrimary;
        if (saturation > 0.0) {
            float red = sr / saturation;
            float green = sg / saturation;
            if (threshold < blackAmount + pureAmount * red) {
                dithered = vec3(1.0, 0.0, 0.0);
            } else if (threshold < blackAmount + pureAmount * (red + green)) {
                dithered = vec3(0.0, 1.0, 0.0);
            } else {
                dithered = vec3(0.0, 0.0, 1.0);
            }
        }
    } else {
        dithered = uWhite == 1 ? vec3(1.0) : dominantPrimary;
    }

    vec4 dtex = vec4(dithered, tex.a);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * dtex;
}
