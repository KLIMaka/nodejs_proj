
Materials.Lambert = function() {

	if (!Materials.Lambert.prototype.shader) Materials.Lambert.prototype.shader = Shaders.get('lambert');
	if (!Materials.Lambert.prototype.per )   Materials.Lambert.prototype.per = {transform : null, color : null};
	if (!Materials.Lambert.prototype.mode)   Materials.Lambert.prototype.mode = gl.TRIANGLES;
	
	this.pre = {light : new GL.Vector()};
	this.default_per = {
		color : [1, 1, 1, 1],
	};
}

Materials.Lambert.prototype = new Materials.Material();

Materials.Lambert.prototype.setLight = function(dir) {
	this.pre.light = dir;
}

Materials.register('lambert', Materials.Lambert);