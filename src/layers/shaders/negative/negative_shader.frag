in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uDryWet;

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);
    vec4 tex = 1.0-oTex;
    tex.a = oTex.a;

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}