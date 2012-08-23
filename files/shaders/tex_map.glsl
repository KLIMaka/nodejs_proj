varying vec2 coord;
uniform mat4 transform;

void main() {
	coord = gl_TexCoord.st;
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

###

uniform sampler2D texture;
uniform float lightmapMult;
uniform vec2 lightmapOff;

varying vec2 coord;

void main() {
	vec2 tc = coord * lightmapMult + lightmapOff;
	gl_FragColor = texture2D(texture, tc);
}