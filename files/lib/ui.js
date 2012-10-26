
var UI = {

	PanelDrawer : function() {

		this.mesh = new GL.Mesh({coords:true});
		this.lastIndex = 0;
		this.lastVertex = 0;
		this.panels = {};
	},

	Panel : function(builder, options) {

		this.id = Entity.genID();
		this.idx = builder.addQuad(options.cx, options.cy, options.cz);
		this.len = 6;
		
		this.uniforms = {
			id        : Entity.intTo4Bytes(this.id),
			transform : new GL.Matrix(),
		}

		Entity.ents[this.id] = this;
	},

}

UI.PanelDrawer.prototype = {

	addQuad : function(cx, cy, cz) {

		cx = cx ? cx : 0.0;
		cy = cy ? cy : 0.0;
		cz = cz ? cz : 0.0;

		var mesh = this.mesh;
		mesh.vertices.push([0.0 - cx, 0.0 - cy, cz]);
		mesh.vertices.push([1.0 - cx, 0.0 - cy, cz]);
		mesh.vertices.push([1.0 - cx, 1.0 - cy, cz]);
		mesh.vertices.push([0.0 - cx, 1.0 - cy, cz]);

		mesh.coords.push([0.0, 0.0]);
		mesh.coords.push([0.0, 1.0]);
		mesh.coords.push([1.0, 1.0]);
		mesh.coords.push([1.0, 0.0]);

		var lv = this.lastVertex;
		mesh.triangles.push([lv+0, lv+2, lv+1]);
		mesh.triangles.push([lv+0, lv+3, lv+2]);
		this.lastVertex += 4;

		mesh.compile();

		var li = this.lastIndex;
		this.lastIndex += 6*2; // offset in bytes
		return li;
	}, 

	createPanel : function(constructor, options) {
		return new constructor(this, options || {});
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

	setRot : function(ang) {

		var scale = new GL.Matrix();
		scale.m[0] = this.uniforms.transform.m[0]
		scale.m[5] = this.uniforms.transform.m[5];

		var trans = new GL.Matrix();
		trans.m[3] = this.uniforms.transform.m[3];
		trans.m[7] = this.uniforms.transform.m[7];

		var rot = GL.Matrix.rotate(ang, 0, 0, 1);

		var mat = GL.Matrix.multiply(trans, rot);
		var mat = GL.Matrix.multiply(mat, scale);

		this.uniforms.transform = mat;
		return this;
	},

	move : function(dx, dy) {
		this.uniforms.transform.m[3] += dx;
		this.uniforms.transform.m[7] += dy;
		return this;
	},

	setMaterial : function(mat) {
		this.material = mat;
		if (mat.onBind) mat.onBind(this);
		return this;
	},

}

