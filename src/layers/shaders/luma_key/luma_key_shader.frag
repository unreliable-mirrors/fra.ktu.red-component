in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec2 uSize;
uniform float uThreshold;
uniform int uNot;
uniform vec4 uDryWet;

void main(){
    vec4 oTex = texture2D(uTexture, vTextureCoord);
    vec4 tex = vec4(0.0, 0.0, 0.0, 0.0);

    float luma = dot(oTex.rgb, vec3(0.2126, 0.7152, 0.0722));
    bool matched = luma >= uThreshold;
    if(uNot == 1){
        matched = !matched;
    }

    if(matched){
        tex = vec4(0.0, 0.0, 0.0, 0.0);
    }else{
        tex = vec4(oTex.r, oTex.g, oTex.b, oTex.a);
    }

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}