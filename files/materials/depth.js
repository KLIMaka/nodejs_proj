
var mat = new Materials.Material('depth');

mat.init = function() {
	this.shader = Shaders.get('depth');
	this.mode = gl.TRIANGLES;
	this.per = {transform : null};
}