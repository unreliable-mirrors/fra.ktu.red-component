precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uMatrixSize;
uniform float uPixelSize;
uniform int uBlack;
uniform int uWhite;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;

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

vec3 primaryProportions(vec3 residual)
{
    vec3 u = uColor1.rgb - uColor3.rgb;
    vec3 v = uColor2.rgb - uColor3.rgb;
    vec3 mR = -residual;
    vec3 b = -uColor3.rgb;

    vec3 p;
    float det = dot(u, cross(v, mR));
    if (abs(det) > 1e-8) {
        float det1 = dot(b, cross(v, mR));
        float det2 = dot(u, cross(b, mR));
        float p1 = det1 / det;
        float p2 = det2 / det;
        p = vec3(p1, p2, 1.0 - p1 - p2);
    } else {
        float s = residual.x + residual.y + residual.z;
        p = s > 0.0 ? residual / s : vec3(1.0, 0.0, 0.0);
    }

    p = max(p, vec3(0.0));
    float s = p.x + p.y + p.z;
    return s > 0.0 ? p / s : vec3(1.0, 0.0, 0.0);
}

vec3 dominant(vec3 p)
{
    vec3 c = uColor1.rgb;
    float m = p.x;
    if (p.y > m) {
        m = p.y;
        c = uColor2.rgb;
    }
    if (p.z > m) {
        c = uColor3.rgb;
    }
    return c;
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

    vec3 residual = tex.rgb - vec3(white);
    vec3 p = primaryProportions(residual);
    vec3 dominantPrimary = dominant(p);

    vec3 dithered;
    if (threshold < blackAmount) {
        dithered = uBlack == 1 ? vec3(0.0) : dominantPrimary;
    } else if (threshold < blackAmount + pureAmount) {
        if (threshold < blackAmount + pureAmount * p.x) {
            dithered = uColor1.rgb;
        } else if (threshold < blackAmount + pureAmount * (p.x + p.y)) {
            dithered = uColor2.rgb;
        } else {
            dithered = uColor3.rgb;
        }
    } else {
        dithered = uWhite == 1 ? vec3(1.0) : dominantPrimary;
    }

    vec4 dtex = vec4(dithered, tex.a);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * dtex;
}
