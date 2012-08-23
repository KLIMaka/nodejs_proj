
var mat = new Materials.Material('ui');

mat.init = function() {

	this.shader = Shaders.get('ui');
	this.mode = gl.TRIANGLES;
	this.per = {transform : null};
	this.texture = null;
}

mat.onBegin = function() {
	if (this.texture) this.texture.bind();
}

mat.setTexture = function(tex) {
	this.texture = tex;
}