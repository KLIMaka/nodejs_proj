varying vec2 coord;

void main() {
	coord = gl_TexCoord.st;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}

###

uniform sampler2D texture;
uniform vec4 color;

varying vec2 coord;

void main() {
	gl_FragColor = texture2D(texture, coord);
}