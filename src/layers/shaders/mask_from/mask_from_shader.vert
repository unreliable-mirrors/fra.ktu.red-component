attribute vec2 aPosition;

uniform mat3 projectionMatrix;
uniform mat3 uBaseMatrix;

varying vec2 vTextureCoord;
varying vec2 vBaseCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
   gl_Position = filterVertexPosition();
   vTextureCoord = filterTextureCoord();
   vBaseCoord = ( uBaseMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
