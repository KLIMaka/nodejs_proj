
Materials.StaticSelect = function() {

	if (!Materials.StaticSelect.prototype.shader) Materials.StaticSelect.prototype.shader = Shaders.get('static_select');
	if (!Materials.StaticSelect.prototype.mode)   Materials.StaticSelect.prototype.mode = gl.TRIANGLES;
}

Materials.StaticSelect.prototype = new Materials.Material();

Materials.register('static_select', Materials.StaticSelect);