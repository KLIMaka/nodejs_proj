
Materials.SolidColor = function() {

	if (!Materials.SolidColor.prototype.shader) Materials.SolidColor.prototype.shader = Shaders.get('wireframe');
	if (!Materials.SolidColor.prototype.per )   Materials.SolidColor.prototype.per = {transform : null, color : null};
	if (!Materials.SolidColor.prototype.mode)   Materials.SolidColor.prototype.mode = gl.TRIANGLES;

	this.default_per = {
		color : [1, 1, 1, 1],
	};
}

Materials.SolidColor.prototype = new Materials.Material();

Materials.register('solid_color', Materials.SolidColor);