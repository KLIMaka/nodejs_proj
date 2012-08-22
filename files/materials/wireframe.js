
var mat = new Materials.Material('wireframe');

mat.init = function() {
	mat.shader = Shaders.get('wireframe');
	mat.pre = {color : [1.0, 1.0, 1.0, 1.0]};
	mat.per = {transform : null};
	mat.mode = gl.LINES;
}

mat.onBind = function(obj) {
	obj.onMeshLoaded(function(){
		if (obj.mesh.lines == undefined)
			obj.mesh.computeWireframe();
	});
}

mat.setColor = function(r,g,b,a) {
	this.pre.color[0] = r;
	this.pre.color[1] = g;
	this.pre.color[2] = b;
	this.pre.color[3] = a;
}

