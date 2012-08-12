varying vec2 coord;
uniform mat4 transform;

void main() {
	coord = gl_TexCoord.st;
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}
