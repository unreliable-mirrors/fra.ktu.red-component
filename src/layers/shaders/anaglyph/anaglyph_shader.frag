precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uPixelSize;
uniform vec4 uDryWet;

vec2 mapCoord( vec2 coord )
{
    coord *= uInputSize.xy;
    coord += uInputSize.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= uInputSize.zw;
    coord /= uInputSize.xy;

    return coord;
}

void main(){
    vec2 pixelCoord = mapCoord(vTextureCoord);

    vec4 oTex = texture2D(uTexture, vTextureCoord);
    vec4 texR = texture2D(uTexture, unmapCoord(pixelCoord + vec2(uPixelSize, 0)));
    vec4 texL = texture2D(uTexture, unmapCoord(pixelCoord - vec2(uPixelSize, 0)));
    vec4 tex = vec4(texL.r, texR.g, texR.b, oTex.a);

    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}