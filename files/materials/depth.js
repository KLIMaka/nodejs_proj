
Materials.Depth = function() {

	if (!Materials.Depth.prototype.shader) Materials.Depth.prototype.shader = Shaders.get('depth');
	if (!Materials.Depth.prototype.per )   Materials.Depth.prototype.per = {transform : null};
	if (!Materials.Depth.prototype.mode)   Materials.Depth.prototype.mode = gl.TRIANGLES;
}

Materials.Depth.prototype = new Materials.Material();

Materials.register('depth', Materials.Depth);