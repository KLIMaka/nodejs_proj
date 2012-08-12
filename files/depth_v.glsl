
varying vec4 pos;
uniform mat4 transform;

void main() {
	gl_Position = pos = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

