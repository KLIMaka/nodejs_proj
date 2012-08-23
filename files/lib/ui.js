
var UI = {

	PanelDrawer : function() {

		this.mesh = new GL.Mesh({coords:true});
		this.lastIndex = 0;
	},

	Panel : function(idx) {

		this.id = Entity.genID();
		this.idx = idx;
		this.len = 6;
		
		this.uniforms = {
			id        : Entity.intTo4Bytes(this.id),
			transform : new GL.Matrix(),
		}
	},

}

UI.PanelDrawer.prototype = {

	addQuad : function() {

		var mesh = this.mesh;
		mesh.vertices.push([0.0, 0.0, 0.0]);
		mesh.vertices.push([1.0, 0.0, 0.0]);
		mesh.vertices.push([1.0, 1.0, 0.0]);
		mesh.vertices.push([0.0, 1.0, 0.0]);

		mesh.coords.push([0.0, 0.0]);
		mesh.coords.push([0.0, 1.0]);
		mesh.coords.push([1.0, 1.0]);
		mesh.coords.push([1.0, 0.0]);

		var li = this.lastIndex;
		mesh.triangles.push([li+0, li+2, li+1]);
		mesh.triangles.push([li+0, li+3, li+2]);
		this.lastIndex += 4;

		mesh.compile();

		return li;
	}, 

	createPanel : function(constructor) {
		return new constructor(this.addQuad());
	},

	draw : function(panel) {
		var mat = panel.material;
		mat.begin();
		mat.drawBuffers(panel, this.mesh.vertexBuffers, this.mesh.indexBuffers.triangles);
	},
}

UI.Panel.prototype = {

	setPos : function(x ,y) {
		this.uniforms.transform.m[3] = x;
		this.uniforms.transform.m[7] = y;
		return this;
	},

	setSize : function(w, h) {
		this.uniforms.transform.m[0] = w;
		this.uniforms.transform.m[5] = h;
		return this;
	},

	setMaterial : function(mat) {
		this.material = mat;
		if (mat.onBind) mat.onBind(this);
		return this;
	},

}

