
var mat = new Materials.Material('wireframe');

mat.init = function() {
	this.shader = Shaders.get('wireframe');
	this.pre = {color : [1.0, 1.0, 1.0, 1.0]};
	this.per = {transform : null};
	this.mode = gl.LINES;
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

