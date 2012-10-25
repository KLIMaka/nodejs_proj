
var UI = {

	PanelDrawer : function() {

		this.mesh = new GL.Mesh({coords:true});
		this.lastIndex = 0;
		this.lastVertex = 0;
		this.panels = {};
	},

	Panel : function(builder) {

		this.id = Entity.genID();
		this.idx = builder.addQuad();
		this.len = 6;
		
		this.uniforms = {
			id        : Entity.intTo4Bytes(this.id),
			transform : new GL.Matrix(),
		}

		Entity.ents[this.id] = this;
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

		var lv = this.lastVertex;
		mesh.triangles.push([lv+0, lv+2, lv+1]);
		mesh.triangles.push([lv+0, lv+3, lv+2]);
		this.lastVertex += 4;

		mesh.compile();

		return this.lastIndex += 6;
	}, 

	createPanel : function(constructor) {
		return new constructor(this);
	},

	draw : function(panel, mat) {
		mat = mat || panel.material;
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

