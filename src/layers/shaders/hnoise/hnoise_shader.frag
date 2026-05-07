precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform vec4 uInputSize;

uniform float uNoiseSize;
uniform float uTime;
uniform float uStrength;
uniform float uLineThickness;
uniform int uNegative;
uniform vec4 uDryWet;

float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio   

float gold_noise(vec2 xy, float seed){
    return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}

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

vec2 pixelate(vec2 coord, float uNoiseSize, float uLineThickness)
{
	return vec2((floor( coord.x / uNoiseSize ) * uNoiseSize) + (uNoiseSize / 2.0), (floor( coord.y / uLineThickness ) * uLineThickness));
}

void main(){
    vec4 oTex = texture(uTexture, vTextureCoord);

    vec2 pixelCoord = mapCoord(vTextureCoord);
    float rowNoiseSize = gold_noise(vec2(floor(pixelCoord.y/uLineThickness)+1080.0, floor(pixelCoord.y/uLineThickness))+1080.0, uTime+2.0)*uNoiseSize;
    vec2 newCoord = pixelate(pixelCoord, rowNoiseSize, uLineThickness);
    float factor = gold_noise(newCoord, uTime+0.0);
    float elegible = gold_noise(newCoord, uTime+1.0);
    
    vec4 tex = oTex;
    if(pixelCoord.x >= newCoord.x - (rowNoiseSize * factor) && pixelCoord.x <= newCoord.x + (rowNoiseSize * factor) && 
     pixelCoord.y >= newCoord.y-1.0  && pixelCoord.y < newCoord.y + (uLineThickness)
     && elegible < uStrength){
        if(uNegative == 0){
            tex = texture(uTexture, unmapCoord(newCoord));
        }else{
            vec4 ntex = texture(uTexture, unmapCoord(newCoord));
            if(oTex.a != 0.0){
                tex = 1.0-ntex;
            }else{
                tex = vec4(0.0,0.0,0.0,0.0);
            }
        }
    }
    
    //DRY/WET
    gl_FragColor = ((1.0-uDryWet)*oTex) + (uDryWet * tex);
}