precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform float uGamma;
uniform float uContrast;
uniform float uSaturation;
uniform float uBrightness;
uniform vec4 uColor;
uniform vec4 uDryWet;

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);

    vec4 tex = oTex;
    if (tex.a > 0.0) {
        tex.rgb /= tex.a;

        vec3 rgb = pow(tex.rgb, vec3(1.0 / uGamma));
        rgb = mix(
            vec3(0.5),
            mix(vec3(dot(vec3(0.2125, 0.7154, 0.0721), rgb)), rgb, uSaturation),
            uContrast
        );
        rgb *= uColor.rgb;
        tex.rgb = rgb * uBrightness;

        tex.rgb *= tex.a;
    }

    tex *= uColor.a;

    // DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}
