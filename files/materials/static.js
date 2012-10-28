
Materials.Static = function() {

	if (!Materials.Static.prototype.shader) Materials.Static.prototype.shader = Shaders.get('static');
	if (!Materials.Static.prototype.mode)   Materials.Static.prototype.mode = gl.TRIANGLES;

	this.pre = {color : [1,1,1,1]};
}

Materials.Static.prototype = new Materials.Material();

Materials.Static.prototype.setColor = function(r, g, b, a) {
	this.pre.color[0] = r;
	this.pre.color[1] = g;
	this.pre.color[2] = b;
	this.pre.color[3] = a;
}


Materials.register('static', Materials.Static);