
varying vec4 pos;
uniform mat4 transform;

void main() {
	gl_Position = pos = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

###


varying vec4 pos;

void main() {
	float depth = pos.z / pos.w;
	gl_FragColor = vec4(depth * 0.5 + 0.5);
}


