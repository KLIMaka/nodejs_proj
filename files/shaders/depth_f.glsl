
varying vec4 pos;

void main() {
	float depth = pos.z / pos.w;
	gl_FragColor = vec4(depth * 0.5 + 0.5);
}

