in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec2 uSize;
uniform float uLowThreshold;
uniform float uTopThreshold;
uniform int uNot;
uniform vec4 uDryWet;

void main(){
    vec4 oTex = texture2D(uTexture, vTextureCoord);
    vec4 tex = vec4(oTex.r, oTex.g, oTex.b, oTex.a);

    float luma = dot(oTex.rgb, vec3(0.2126, 0.7152, 0.0722));

    float lowThreshold = min(uLowThreshold, uTopThreshold);
    float topThreshold = max(uLowThreshold, uTopThreshold);
    float thresholdRange = max(topThreshold - lowThreshold, 0.00001);

    float alphaFactor = 1.0;
    if(luma >= topThreshold){
        alphaFactor = 0.0;
    }else if(luma > lowThreshold){
        alphaFactor = (topThreshold - luma) / thresholdRange;
    }

    if(uNot == 1){
        alphaFactor = 1.0 - alphaFactor;
    }

    tex.a = oTex.a * clamp(alphaFactor, 0.0, 1.0);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}