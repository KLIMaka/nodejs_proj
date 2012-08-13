uniform sampler2D texture;
uniform vec4 color;

uniform float lightmapMult;
uniform vec2 lightmapOff;

varying vec2 coord;

void main() {
	vec2 tc = coord * lightmapMult + lightmapOff;
	gl_FragColor = texture2D(texture, tc);
}