
var mat = new Materials.Material('select');

mat.init = function() {
	this.shader = Shaders.get('select');
	this.mode = gl.TRIANGLES;
	this.per = {transform: null, id : null};
}