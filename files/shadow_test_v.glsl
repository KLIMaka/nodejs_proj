uniform mat4 shadowMapMatrix;
uniform vec3 light;
attribute vec2 offsetCoord;
attribute vec4 offsetPosition;
varying vec4 coord;
varying vec3 normal;

void main() {
  normal = gl_Normal;
  vec4 pos = offsetPosition;
  
  /*
   * This is a hack that avoids leaking light immediately behind polygons by
   * darkening creases in front of polygons instead. It biases the position
   * forward toward the light to compensate for the bias away from the light
   * applied by the fragment shader. This is only necessary because we have
   * infinitely thin geometry and is not needed with the solid geometry
   * present in most scenes. I made this hack up and have not seen it before.
   */
  pos.xyz += normalize(cross(normal, cross(normal, light))) * 0.02;
  
  coord = shadowMapMatrix * pos;
  gl_Position = vec4(offsetCoord * 2.0 - 1.0, 0.0, 1.0);
}

