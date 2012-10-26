uniform mat4 transform;

void main() {
	vec4 vert = vec4(gl_Vertex.xyz * 4.0, 1.0);
	gl_Position = gl_ModelViewProjectionMatrix * transform * vert;
}

###

uniform vec4 id;

void main() {
	gl_FragColor = id;
}