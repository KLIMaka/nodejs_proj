uniform mat4 transform;

void main() {
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

###

uniform vec4 color;

void main() {
	gl_FragColor = color;
}