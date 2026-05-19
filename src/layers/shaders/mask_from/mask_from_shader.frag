in vec2 vTextureCoord;
in vec2 vMaskCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uLowThreshold;
uniform float uTopThreshold;
uniform int uInverse;

uniform vec4 uDryWet;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
    float lowThreshold = min(uLowThreshold, uTopThreshold);
    float topThreshold = max(uLowThreshold, uTopThreshold);
    float thresholdRange = max(topThreshold - lowThreshold, 0.00001);

    vec4 tex = texture(uTexture, vTextureCoord);

    vec4 maskTex = texture(uMaskTexture, vMaskCoord);;

    float maskLightness = rgb2hsv(maskTex.xyz).z;
    float alphaFactor = 1.0;
    if(maskLightness >= topThreshold){
        alphaFactor = 0.0;
    }else if(maskLightness > lowThreshold){
        alphaFactor = (topThreshold - maskLightness) / thresholdRange;
    }

    if (uInverse == 1) {
        alphaFactor = 1.0 - alphaFactor;
    }

    gl_FragColor = vec4(0.0,0.0,0.0,0.0);
    if((vMaskCoord.x > 0.0 && vMaskCoord.x < 1.0) && (vMaskCoord.y > 0.0 && vMaskCoord.y < 1.0)){
        if(alphaFactor > 0.0){
            gl_FragColor = tex;
            gl_FragColor *= min(alphaFactor, tex.a);
        }
    }else{
        tex = gl_FragColor;
    }

    gl_FragColor = ((1.0-uDryWet)*tex) + (uDryWet * gl_FragColor);
}
