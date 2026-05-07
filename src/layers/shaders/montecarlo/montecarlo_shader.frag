in vec2 vTextureCoord;

uniform sampler2D uTexture;

uniform vec2 uSize;
uniform float uTime;
uniform float uStrength;
uniform int uNot;
uniform vec4 uDryWet;

float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio   

float gold_noise(vec2 xy, float seed){
    return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);
    float noise = gold_noise(vTextureCoord*uSize, uTime);
    vec4 tex = vec4(0.0, 0.0, 0.0, 0.0);
    if(noise < 1.0-uStrength){
        if(uNot == 0){
            tex = oTex;
        }
    }else if(uNot == 1){
        tex = oTex;
    }
    
    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}