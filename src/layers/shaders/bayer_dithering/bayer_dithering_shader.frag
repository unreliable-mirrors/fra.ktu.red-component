precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec2 uSize;

uniform float uMatrixSize;
uniform float uLevels;
uniform int uNot;

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

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);

    float gray = dot(oTex.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec2 coord = floor(vTextureCoord * uSize);

    float threshold;
    if (uMatrixSize <= 2.0) {
        threshold = bayer2(coord);
    } else if (uMatrixSize <= 4.0) {
        threshold = bayer4(coord);
    } else if (uMatrixSize <= 8.0) {
        threshold = bayer8(coord);
    } else {
        threshold = bayer16(coord);
    }

    float levels = max(uLevels, 2.0);
    float scale = levels - 1.0;
    float q = floor(gray * scale + threshold);
    float dithered = clamp(q, 0.0, scale) / scale;

    if (uNot == 1) {
        dithered = 1.0 - dithered;
    }

    vec4 tex = vec4(dithered, dithered, dithered, oTex.a);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}
