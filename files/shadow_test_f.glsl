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
  gl_FragColor = vec4(vec3(color), 1.0 / (1.0 + sampleCount));
}