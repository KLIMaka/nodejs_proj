
Materials.TexMap = function() {

	if (!Materials.TexMap.prototype.shader) Materials.TexMap.prototype.shader = Shaders.get('tex_map');
	if (!Materials.TexMap.prototype.per )   Materials.TexMap.prototype.per = {transform : null, lightmapOff : null};
	if (!Materials.TexMap.prototype.mode)   Materials.TexMap.prototype.mode = gl.TRIANGLES;

	this.pre = {lightmapMult : 1};
	this.texture = null;
}

Materials.TexMap.prototype = new Materials.Material();

Materials.TexMap.prototype.connect = function(atlas) {
	this.texture = atlas.texture;
	this.pre.lightmapMult = atlas.delta;
}

Materials.TexMap.prototype.onBegin = function() {
	this.texture.bind();
}


Materials.register('tex_map', Materials.TexMap);