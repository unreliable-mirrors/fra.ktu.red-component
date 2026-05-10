in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform vec4 uColor4;
uniform vec4 uColor5;
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

float hueDistance(float h1, float h2)
{
    float d = abs(h1 - h2);
    return min(d, 1.0 - d);
}

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);
    vec3 hsv = rgb2hsv(oTex.rgb);

    vec3 color1 = rgb2hsv(uColor1.rgb);
    vec3 color2 = rgb2hsv(uColor2.rgb);
    vec3 color3 = rgb2hsv(uColor3.rgb);
    vec3 color4 = rgb2hsv(uColor4.rgb);
    vec3 color5 = rgb2hsv(uColor5.rgb);

    float distance1 = color1.z > 0.0 ? hueDistance(color1.x, hsv.x) : 999.0;
    float distance2 = color2.z > 0.0 ? hueDistance(color2.x, hsv.x) : 999.0;
    float distance3 = color3.z > 0.0 ? hueDistance(color3.x, hsv.x) : 999.0;
    float distance4 = color4.z > 0.0 ? hueDistance(color4.x, hsv.x) : 999.0;
    float distance5 = color5.z > 0.0 ? hueDistance(color5.x, hsv.x) : 999.0;

    float minDistance = min(distance1, min(distance2, min(distance3, min(distance4, distance5))));

    vec3 targetColor = color1;
    if(distance2 == minDistance){
        targetColor = color2;
    }
    if(distance3 == minDistance){
        targetColor = color3;
    }
    if(distance4 == minDistance){
        targetColor = color4;
    }
    if(distance5 == minDistance){
        targetColor = color5;
    }

    vec3 newColor = hsv;
    if(uOnlyHue == 1){
        newColor.x = targetColor.x;
    }
    if(uOnlySaturation == 1){
        newColor.y = targetColor.y;
    }
    if(uOnlyLightness == 1){
        newColor.z = targetColor.z;
    }

    vec4 tex = vec4(hsv2rgb(newColor), oTex.a);

    //DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}
