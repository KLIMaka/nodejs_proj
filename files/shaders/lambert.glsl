uniform mat4 transform;
varying vec3 normal;

void main() {
	mat3 normalmat = mat3(transform[0].xyz, transform[1].xyz, transform[2].xyz);
	normal = normalmat * gl_Normal;
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