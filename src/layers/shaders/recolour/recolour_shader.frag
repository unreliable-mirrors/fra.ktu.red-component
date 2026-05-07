in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uFromColor;
uniform vec4 uToColor;

uniform float uThreshold;
uniform int uNot;
uniform int uOnlyHue;
uniform int uOnlySaturation;
uniform int uOnlyLightness;
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
    vec4 oTex = texture2D(uTexture, vTextureCoord);
    
    vec4 tex = vec4(oTex.r, oTex.g, oTex.b, oTex.a);

    vec4 color = vec4(uToColor.r, uToColor.g, uToColor.b, oTex.a);
        
    if(uOnlyHue == 1 || uOnlySaturation == 1 || uOnlyLightness == 1){
        vec3 hsvFrom = rgb2hsv(oTex.rgb);
        vec3 hsvTo = rgb2hsv(vec3(uToColor.rgb));

        vec3 hsv = hsvFrom;
        if(uOnlyHue == 1){
            hsv.x = hsvTo.x;
        }
        if(uOnlySaturation == 1){
            hsv.y = hsvTo.y;
        }
        if(uOnlyLightness == 1){
            hsv.z = hsvTo.z;
        }
        vec3 rgb = hsv2rgb(vec3(hsv.x, hsv.y, hsv.z));
        color = vec4(rgb.r,rgb.g,rgb.b,oTex.a);
    }
    if(oTex.r >= uFromColor.r - uThreshold && oTex.r <= uFromColor.r + uThreshold &&
    oTex.g >= uFromColor.g - uThreshold && oTex.g <= uFromColor.g + uThreshold &&
    oTex.b >= uFromColor.b - uThreshold && oTex.b <= uFromColor.b + uThreshold){
        if(uNot == 0){
            tex = color;
        }
    }else if(uNot == 1){
        tex = color;
    }
    
    //DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}