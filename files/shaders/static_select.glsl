attribute vec4 id;
varying vec4 v_id;

void main() {
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	v_id = id;
}

###

varying vec4 v_id;

void main() {
	gl_FragColor = v_id;
}