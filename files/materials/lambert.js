
var mat = new Materials.Material('lambert');

mat.init = function() {
	this.shader = Shaders.get('lambert');
	this.pre = {light : new GL.Vector()};
	this.per = {transform : null};
	this.mode = gl.TRIANGLES;
}

mat.setLight = function(dir) {
	this.pre.light = dir;
}