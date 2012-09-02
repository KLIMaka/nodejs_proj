
Materials.Wireframe = function() {

	if (!Materials.Wireframe.prototype.shader) Materials.Wireframe.prototype.shader = Shaders.get('wireframe');
	if (!Materials.Wireframe.prototype.per )   Materials.Wireframe.prototype.per = {transform : null};
	if (!Materials.Wireframe.prototype.mode)   Materials.Wireframe.prototype.mode = gl.LINES;

	this.pre = {color : [1.0, 1.0, 1.0, 1.0]};
}

Materials.Wireframe.prototype = new Materials.Material();

Materials.Wireframe.prototype.onBind = function(obj) {
	obj.onMeshLoaded(function(){
		if (obj.mesh.lines == undefined)
			obj.mesh.computeMaterials.Wireframe();
	});
}

Materials.Wireframe.prototype.setColor = function(r, g, b, a) {
	this.pre.color[0] = r;
	this.pre.color[1] = g;
	this.pre.color[2] = b;
	this.pre.color[3] = a;
}


Materials.register('wireframe', Materials.Wireframe);

