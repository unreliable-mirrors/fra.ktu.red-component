in vec2 vTextureCoord;

uniform sampler2D uTexture;

uniform float uThreshold;
uniform float uPower;
uniform int uDarken;
uniform int uLighten;
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
    vec4 oTex = texture(uTexture, vTextureCoord);
    
    vec3 hsv = rgb2hsv(oTex.rgb);
    if(hsv.z <= uThreshold && uDarken == 1){
        if(uInverse == 0){
            hsv.z = pow(hsv.z-0.01, uPower);
        }else{
            hsv.z = pow(hsv.z+0.01, 1.0/uPower);
        }
    }else if(hsv.z >= uThreshold && uLighten == 1){
        if(uInverse == 0){
            hsv.z = pow(hsv.z+0.01, 1.0/uPower);
        }else{
            hsv.z = pow(hsv.z-0.01, uPower);
        }
    }
    vec3 tex3 = hsv2rgb(hsv);

    vec4 tex = vec4(tex3.r, tex3.g, tex3.b, oTex.a);
    
    //DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}