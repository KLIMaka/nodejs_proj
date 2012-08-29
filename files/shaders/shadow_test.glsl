uniform mat4 shadowMapMatrix;
uniform mat4 transform;
uniform vec3 light;
uniform float lightmapMult;
uniform vec2 lightmapOff;
varying vec4 coord;
varying vec3 normal;

void main() {
  normal = gl_Normal;
  vec4 pos = transform * gl_Vertex;  
  coord = shadowMapMatrix * pos;
  vec2 tc = gl_TexCoord.st * lightmapMult + lightmapOff;
  gl_Position = vec4(tc * 2.0 - 1.0, 0.0, 1.0);
}

###

uniform float sampleCount;
uniform sampler2D depthMap;
uniform vec3 light;
varying vec4 coord;
varying vec3 normal;

void main() {
  /* Run shadow test */
  const float bias = -0.00299;
  float depth = texture2D(depthMap, coord.xy / coord.w * 0.5 + 0.5).r;
  float shadow = (bias + coord.z / coord.w * 0.5 + 0.5 - depth > 0.0) ? 1.0 : 0.0;
  
  /* Points on polygons facing away from the light are always in shadow */
  float color = dot(normal, light) > 0.0 ? 1.0 - shadow : 0.0;
  gl_FragColor = vec4(vec3(color)/**dot(normal, light)*/, 1.0 / (1.0 + sampleCount));
}

