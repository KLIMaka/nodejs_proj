varying vec2 coord;
uniform mat4 transform;

void main() {
	coord = gl_TexCoord.st;
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

###

uniform sampler2D texture;
uniform vec4 color;
uniform float wireframe;

uniform float lightmapMult;
uniform vec2 lightmapOff;

varying vec2 coord;

const vec4 wireframeColor = vec4(1, 0.8, 0.3, 1.0);

void main() {
	vec2 tc = coord * lightmapMult + lightmapOff;
	gl_FragColor = texture2D(texture, tc) * (1.0-wireframe) + wireframeColor*wireframe;
}