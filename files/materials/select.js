
Materials.Select = function() {
	
	if (!Materials.Select.prototype.shader) Materials.Select.prototype.shader = Shaders.get('select');
	if (!Materials.Select.prototype.per )   Materials.Select.prototype.per = {transform : null, id : null};
	if (!Materials.Select.prototype.mode)   Materials.Select.prototype.mode = gl.TRIANGLES;
}

Materials.Select.prototype = new Materials.Material();

Materials.register('select', Materials.Select);