uniform mat4 transform;
varying vec2 coord;

void main() {
	coord = gl_TexCoord.st;
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

###

uniform sampler2D texture;
varying vec2 coord;

void main() {
	gl_FragColor = texture2D(texture, coord);
}