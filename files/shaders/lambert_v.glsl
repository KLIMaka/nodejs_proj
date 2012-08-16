uniform mat4 transform;
varying vec3 normal;

void main() {
	normal = gl_Normal;
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}