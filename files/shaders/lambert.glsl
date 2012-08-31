uniform mat4 transform;
varying vec3 normal;

void main() {
	normal = gl_Normal;
	gl_Position = gl_ModelViewProjectionMatrix * transform * gl_Vertex;
}

###

uniform vec3 light;
uniform vec4 color;
varying vec3 normal;

void main() {

	float col = dot(light, normal);
	/*col = (col + 1.0) / 4.0;*/
	gl_FragColor = color * col;
}