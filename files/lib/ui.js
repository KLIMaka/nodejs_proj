
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

	StaticDrawer : function(n) {

		this.mesh = new Mesh2D({
			length : n,
			attrs : {
				gl_Vertex : {size : 3},
				color     : {size : 4, type : Uint8Array, normalized : true},
				id        : {size : 4, type : Uint8Array, normalized : true},
			}
		});
		this.idx = 0;
		this.len = 0;

	},

	StaticQuad : function(builder, options) {

		this.id = Entity.genID();
		var id = Entity.intTo4Bytes(this.id);

		var cx = options.cx ? options.cx : 0.0;
		var cy = options.cy ? options.cy : 0.0;
		var cz = options.cz ? options.cz : 0.0;

		this.cx = cx;
		this.cy = cy;
		this.z = cz;
		this.w = 1;
		this.h = 1;
		this.x = 0;
		this.y = 0;
		this.ang = 0;

		var quad = {
			a : {
				gl_Vertex: [0.0 - cx, 0.0 - cy, cz],
				id       : id,
				color    : [127, 127, 127, 255],
			},
			b : {
				gl_Vertex: [1.0 - cx, 0.0 - cy, cz],
				id       : id,
				color    : [127, 127, 127, 255],
			},
			c : {
				gl_Vertex: [1.0 - cx, 1.0 - cy, cz],
				id       : id,
				color    : [255, 255, 255, 255],
			},
			d : {
				gl_Vertex: [0.0 - cx, 1.0 - cy, cz],
				id       : id,
				color    : [255, 255, 255, 255],
			},
		}

		this.quad = builder.mesh.addQuad(quad);
		builder.len += 6;
		this.builder = builder;
		Entity.ents[this.id] = this;
	},

}

UI.StaticDrawer.prototype = {

	create : function(constructor, options) {
		return new constructor(this, options || {});
	},

	draw : function(mat) {
		mat.begin();
		mat.drawBuffers(this, this.mesh.vertexBuffers, this.mesh.indexBuffers.triangles);
	},
}

UI.StaticQuad.prototype = {

	genTransformMatrix : function() {
		
		var scale = GL.Matrix.scale(this.w, this.h, 1);
		var trans = GL.Matrix.translate(this.x, this.y, 0);
		var rot   = GL.Matrix.rotate(this.ang, 0, 0, 1);

		var mat = GL.Matrix.multiply(trans, rot);
		mat = GL.Matrix.multiply(mat, scale, mat);
		
		return mat;
	},

	recalc : function() {

		var mat = this.genTransformMatrix();
		var cx = this.cx, cy = this.cy;
		var a = mat.transformPoint(new GL.Vector(0.0 - cx, 0.0 - cy));
		var b = mat.transformPoint(new GL.Vector(1.0 - cx, 0.0 - cy));
		var c = mat.transformPoint(new GL.Vector(1.0 - cx, 1.0 - cy));
		var d = mat.transformPoint(new GL.Vector(0.0 - cx, 1.0 - cy));

		this.quad.a.gl_Vertex.set([a.x, a.y]);
		this.quad.b.gl_Vertex.set([b.x, b.y]);
		this.quad.c.gl_Vertex.set([c.x, c.y]);
		this.quad.d.gl_Vertex.set([d.x, d.y]);

		this.builder.mesh.vertexBuffers.gl_Vertex.setDirt();
	},

	setPos : function(x, y) {
		
		this.x = x;
		this.y = y;
		this.recalc();

		return this;
	}, 

	setSize : function(w, h) {
		this.w = w;
		this.h = h;
		this.recalc();
		return this;
	},

	setRot : function(ang) {
		this.ang = ang;
		this.recalc();
		return this;
	},

	move : function(dx, dy) {
		this.x += dx;
		this.y += dy;
		this.recalc();
		return this;
	},

	setColor : function(r ,g, b, a) {
		r = (r * 255) & 0xff;
		g = (g * 255) & 0xff;
		b = (b * 255) & 0xff;
		a = (a * 255) & 0xff;
		this.quad.a.color.set([r,g,b,a]);
		this.quad.b.color.set([r,g,b,a]);
		this.quad.c.color.set([r,g,b,a]);
		this.quad.d.color.set([r,g,b,a]);
		this.builder.mesh.vertexBuffers.color.setDirt();
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

