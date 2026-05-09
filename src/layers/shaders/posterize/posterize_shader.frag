in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform float uLevels;
uniform vec4 uDryWet;

float roundValue(float x) {
    return x - floor(x) > 0.5 ? ceil(x) : floor(x);
}

void main() {
    vec4 oTex = texture(uTexture, vTextureCoord);

    // Avoid division by zero and preserve a minimum of 2 discrete levels.
    float levels = max(uLevels, 2.0);
    float scale = levels - 1.0;

    vec4 tex = oTex;
    tex.r = roundValue(tex.r * scale) / scale;
    tex.g = roundValue(tex.g * scale) / scale;
    tex.b = roundValue(tex.b * scale) / scale;

    gl_FragColor = (1.0 - uDryWet) * oTex + uDryWet * tex;
}
