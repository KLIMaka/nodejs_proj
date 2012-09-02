
Materials.UI = function() {

	if (!Materials.UI.prototype.shader) Materials.UI.prototype.shader = Shaders.get('ui');
	if (!Materials.UI.prototype.per )   Materials.UI.prototype.per = {transform : null};
	if (!Materials.UI.prototype.mode)   Materials.UI.prototype.mode = gl.TRIANGLES;

	this.texture = null;
}

Materials.UI.prototype = new Materials.Material();

Materials.UI.prototype.onBegin = function() {
	if (this.texture) this.texture.bind();
}

Materials.UI.prototype.setTexture = function(tex) {
	this.texture = tex;
}

Materials.register('ui', Materials.UI);