
var mat = new Materials.Material('tex_map');

mat.init = function() {
	this.shader = Shaders.get('tex_map');
	this.mode = gl.TRIANGLES;
	this.pre = {lightmapMult : 1};
	this.per = {transform : null, lightmapOff : null};
	this.texture = null;
}

mat.connect = function(atlas) {
	this.texture = atlas.texture;
	this.pre.lightmapMult = atlas.delta;
}

mat.onBegin = function() {
	this.texture.bind();
}