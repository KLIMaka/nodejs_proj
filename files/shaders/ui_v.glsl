varying vec2 coord;

void main() {
	coord = gl_TexCoord.st;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
