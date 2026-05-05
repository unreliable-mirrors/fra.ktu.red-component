in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uDryWet;

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);
    float shade = (oTex.r + oTex.g + oTex.b) / 3.0;
    vec4 tex = vec4(shade, shade, shade, oTex.a);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}