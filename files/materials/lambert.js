
var mat = new Materials.Material('lambert');

mat.init = function() {
	this.shader = Shaders.get('lambert');
	this.pre = {light : new GL.Vector()};
	this.per = {transform : null, color : null};
	this.mode = gl.TRIANGLES;
	this.default_per = {
		color : [1, 1, 1, 1],
	}
}

mat.setLight = function(dir) {
	this.pre.light = dir;
}