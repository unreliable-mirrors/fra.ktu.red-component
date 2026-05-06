in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec2 uSize;
uniform vec4 uColor;
uniform float uThreshold;
uniform int uNot;
uniform vec4 uDryWet;

void main(){
    vec4 oTex = texture2D(uTexture, vTextureCoord);
    vec4 tex = vec4(0.0, 0.0, 0.0, 0.0);
    if(oTex.r >= uColor.r - uThreshold && oTex.r <= uColor.r + uThreshold &&
    oTex.g >= uColor.g - uThreshold && oTex.g <= uColor.g + uThreshold &&
    oTex.b >= uColor.b - uThreshold && oTex.b <= uColor.b + uThreshold ){
        if(uNot == 0){
            tex = vec4(0.0, 0.0, 0.0, 0.0);
        }else{
            tex = vec4(oTex.r, oTex.g, oTex.b, oTex.a);    
        }
    }else{
        if(uNot == 0){
            tex = vec4(oTex.r, oTex.g, oTex.b, oTex.a);    
        }else{
            tex = vec4(0.0, 0.0, 0.0, 0.0);
        }
        
    }

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}