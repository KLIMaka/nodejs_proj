uniform sampler2D texture;
uniform vec4 color;

varying vec2 coord;

void main() {
	gl_FragColor = texture2D(texture, coord);
}