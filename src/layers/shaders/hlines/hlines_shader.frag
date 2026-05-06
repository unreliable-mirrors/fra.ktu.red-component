precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uDistance;
uniform float uThickness;
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

vec2 pixelate(vec2 coord, float uDistance)
{
	return (floor( coord / vec2(uDistance,uDistance) ) * vec2(uDistance,uDistance)) + (uDistance / 2.0);
}

void main(){
    vec2 pixelCoord = mapCoord(vTextureCoord);
    vec2 newCoords = pixelate(pixelCoord, uDistance);
    vec4 oTex = texture(uTexture, vTextureCoord);
    vec4 tex = vec4(0.0, 0.0, 0.0, 0.0);
    if(pixelCoord.y > newCoords.y-(uThickness/2.0) && pixelCoord.y < newCoords.y+(uThickness/2.0)){
        tex = vec4(oTex.r, oTex.g, oTex.b, oTex.a);
    }
    
    //DRY/WET
    gl_FragColor = (1.0-uDryWet)*oTex +uDryWet * tex;
}