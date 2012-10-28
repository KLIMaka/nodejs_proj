attribute vec4 color;
varying vec4 v_color;

void main() {
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	v_color = color;
}

###

uniform vec4 color;
varying vec4 v_color;

void main() {
	gl_FragColor = color * v_color;
}